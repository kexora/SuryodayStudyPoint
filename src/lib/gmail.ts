import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/gmail.send');

let cachedAccessToken: string | null = null;

export const connectGmail = async (): Promise<string> => {
  try {
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Firebase Auth');
    }
    cachedAccessToken = credential.accessToken;
    return cachedAccessToken;
  } catch (error) {
    console.error('Gmail connect error:', error);
    throw error;
  }
};

export const getGmailToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const sendEmail = async (to: string[], subject: string, body: string) => {
  const token = await getGmailToken();
  if (!token) throw new Error('Gmail not connected');

  const emailLines = [
    `To: ${to.join(', ')}`,
    'Content-Type: text/html; charset=utf-8',
    'MIME-Version: 1.0',
    `Subject: ${subject}`,
    '',
    body
  ];

  const email = emailLines.join('\r\n').trim();
  const base64EncodedEmail = btoa(unescape(encodeURIComponent(email)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const response = await fetch('https://gmail.googleapis.com/upload/gmail/v1/users/me/messages/send?uploadType=media', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'message/rfc822',
    },
    body: base64EncodedEmail,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Gmail API error: ${errorData.error?.message || 'Unknown error'}`);
  }

  return await response.json();
};
