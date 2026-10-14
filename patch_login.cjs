const fs = require('fs');
let content = fs.readFileSync('src/common/components/LoginForm.tsx', 'utf8');

// 1. Remove CRHS ID stuff
content = content.replace("import { generateCrhsId, validateMobileNumber, validatePincode, validateEmail, validatePassword } from '@/lib/crhsId';", "import { validateMobileNumber, validateEmail, validatePassword } from '@/lib/crhsId';");

const oldRegData = `const [regData, setRegData] = useState<RegistrationFormData>({
    fullName: '',
    mobileNumber: '',
    fatherName: '',
    motherName: '',
    villageTown: '',
    block: '',
    district: '',
    state: 'Bihar',
    pincode: '',
    email: '',
    password: '',
  });`;

const newRegData = `const [regData, setRegData] = useState({
    fullName: '',
    mobileNumber: '',
    email: '',
    password: '',
  });`;

content = content.replace(oldRegData, newRegData);
content = content.replace("const [currentRegStep, setCurrentRegStep] = useState(1);", "");
content = content.replace("const [registeredCrhsId, setRegisteredCrhsId] = useState<string | null>(null);", "");

// Replace handleRegisterSubmit
const oldHandleRegister = content.substring(content.indexOf('const handleRegisterSubmit'), content.indexOf('const handleLoginSubmit'));

const newHandleRegister = `const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    let isValid = true;
    const errors: any = {};
    if (!regData.fullName.trim()) { errors.fullName = 'Full Name is required'; isValid = false; }
    if (!regData.mobileNumber.trim() || !validateMobileNumber(regData.mobileNumber)) {
      errors.mobileNumber = 'Must be a valid 10-digit mobile number'; isValid = false;
    }
    if (!regData.email.trim() || !validateEmail(regData.email)) {
      errors.email = 'Valid Email is required'; isValid = false;
    }
    if (!regData.password || !validatePassword(regData.password)) {
      errors.password = 'Password must be at least 6 characters'; isValid = false;
    }

    if (!isValid) {
      setRegErrors(errors);
      setTouchedFields({fullName: true, mobileNumber: true, email: true, password: true});
      setError('Please fix the validation errors.');
      return;
    }

    setIsLoading(true);

    try {
      const cleanEmail = regData.email.trim().toLowerCase();
      const cleanMobile = regData.mobileNumber.trim().replace(/[\\s-]/g, '');

      // 1. Create Firebase Auth user
      const userCred = await withAuthRetry(() => createUserWithEmailAndPassword(auth, cleanEmail, regData.password));
      const user = userCred.user;

      // 2. Save User Profile to Firestore Database
      const userProfile = {
        uid: user.uid,
        role: '__kx_0x5' as const, // Parent role
        email: cleanEmail,
        fullName: regData.fullName.trim(),
        name: regData.fullName.trim(),
        mobileNumber: cleanMobile,
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', user.uid), userProfile);

      setSuccessMessage('Registration successful! Logging you in...');
      
      setTimeout(() => {
        setIsLoading(false);
        refreshUserData();
        navigate('/dashboard');
      }, 1500);

    } catch (err: any) {
      console.error("Registration Error:", err);
      let errMsg = 'Failed to register. Please try again later.';
      if (err.code === 'auth/email-already-in-use') {
        errMsg = 'This email is already registered. Please login instead.';
      }
      setError(errMsg);
      setIsLoading(false);
    }
  };

  `;

content = content.replace(oldHandleRegister, newHandleRegister);

// Delete handleNextStep and handlePrevStep
const nextStepStart = content.indexOf('const handleNextStep');
const withAuthStart = content.indexOf('const withAuthRetry');
if (nextStepStart !== -1 && withAuthStart !== -1) {
    content = content.substring(0, nextStepStart) + content.substring(withAuthStart);
}

fs.writeFileSync('src/common/components/LoginForm.tsx', content);
