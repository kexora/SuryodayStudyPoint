import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import firebaseConfig from '../../firebase-applet-config.json';

const driveApp = initializeApp(firebaseConfig, 'driveApp');
const driveAuth = getAuth(driveApp);

const provider = new GoogleAuthProvider();
// Request Google Drive Scope
provider.addScope('https://www.googleapis.com/auth/drive.file');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

const TOKEN_KEY = 'crhs_drive_access_token';
const EXPIRY_KEY = 'crhs_drive_token_expires_at';

export const getGlobalDriveToken = async (): Promise<string | null> => {
  try {
    const docRef = doc(db, 'systemConfig', 'googleDriveAuth');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data.connected && data.accessToken) {
        // Allow a small grace period for expiration check
        if (data.expiresAt && Date.now() > (data.expiresAt - 60000)) {
           return null; // Expired
        }
        return data.accessToken;
      }
    }
    return null;
  } catch (err) {
    console.error("Failed to fetch global drive token:", err);
    return null;
  }
};

export const checkGlobalDriveStatus = async (): Promise<boolean> => {
  const token = await getGlobalDriveToken();
  return !!token;
};

export const getDriveAccessToken = (): string | null => {
  if (cachedAccessToken) {
    const expiresAt = localStorage.getItem(EXPIRY_KEY);
    if (expiresAt && Date.now() > parseInt(expiresAt, 10)) {
      disconnectGoogleDrive();
      return null;
    }
    return cachedAccessToken;
  }

  // Restore from localStorage across page refreshes
  const storedToken = localStorage.getItem(TOKEN_KEY);
  const expiresAt = localStorage.getItem(EXPIRY_KEY);

  if (storedToken && expiresAt) {
    if (Date.now() < parseInt(expiresAt, 10)) {
      cachedAccessToken = storedToken;
      return cachedAccessToken;
    } else {
      disconnectGoogleDrive();
    }
  }

  return null;
};

export const setDriveAccessToken = (token: string, expiresInSeconds: number = 3500) => {
  cachedAccessToken = token;
  const expiresAt = Date.now() + expiresInSeconds * 1000;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(EXPIRY_KEY, expiresAt.toString());
};

export const disconnectGoogleDrive = () => {
  cachedAccessToken = null;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EXPIRY_KEY);
  signOut(driveAuth).catch(() => {});
};

export const initDriveAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(driveAuth, async (user: User | null) => {
    const token = getDriveAccessToken();
    if (user && token) {
      if (onAuthSuccess) onAuthSuccess(user, token);
    } else {
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const signInWithGoogleDrive = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(driveAuth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to obtain Google OAuth access token');
    }

    setDriveAccessToken(credential.accessToken, 3500);
    return { user: result.user, accessToken: credential.accessToken };
  } catch (error: any) {
    console.error('Google Drive sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getOrCreateDriveFolder = async (token: string, folderName: string, parentId?: string): Promise<string> => {
  // Search for the folder
  let query = `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
  if (parentId) {
    query += ` and '${parentId}' in parents`;
  }
  
  const searchResponse = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (searchResponse.status === 401) {
    disconnectGoogleDrive();
    throw new Error('401 Unauthorized: Drive session expired. Please connect Google Drive again.');
  }
  
  const searchData = await searchResponse.json();
  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0].id; // Return existing folder ID
  }
  
  // Create the folder if it doesn't exist
  const metadata: any = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
  };
  if (parentId) {
    metadata.parents = [parentId];
  }
  
  const createResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(metadata),
  });

  if (createResponse.status === 401) {
    disconnectGoogleDrive();
    throw new Error('401 Unauthorized: Drive session expired. Please connect Google Drive again.');
  }
  
  const createData = await createResponse.json();
  if (!createResponse.ok) {
     throw new Error(createData.error?.message || `Failed to create folder ${folderName}`);
  }
  
  return createData.id;
};
