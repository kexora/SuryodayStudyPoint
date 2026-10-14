const fs = require('fs');
let content = fs.readFileSync('src/common/components/AdmissionForm.tsx', 'utf8');

// I need to add state for existingAppStatus and existingAppCrhsId
content = content.replace("const [enrollmentNo, setEnrollmentNo] = useState('');", "const [enrollmentNo, setEnrollmentNo] = useState('');\n  const [existingAppStatus, setExistingAppStatus] = useState<string>('Pending');\n  const [existingAppCrhsId, setExistingAppCrhsId] = useState<string>('');");

// Let's find where hasExistingApp is set.
const checkLogic = `
        if (!querySnapshot.empty) {
          const appDoc = querySnapshot.docs[0];
          setHasExistingApp(true);
          setEnrollmentNo(appDoc.data().enrollmentNo);
          setExistingAppStatus(appDoc.data().status || 'Pending');
          if (appDoc.data().crhsId) {
             setExistingAppCrhsId(appDoc.data().crhsId);
          }
        }
`;

content = content.replace(/if \(!querySnapshot\.empty\) \{[\s\S]*?setEnrollmentNo.*?;\n        \}/, checkLogic);

// Now update the UI for hasExistingApp
const uiLogic = `
  if (hasExistingApp || isSubmitted) {
    return (
      <Card className="w-full mx-auto border-0 shadow-xl bg-white overflow-hidden">
        <CardContent className="p-12 text-center flex flex-col items-center">
          <div className={\`w-24 h-24 rounded-full flex items-center justify-center mb-6 \${existingAppStatus === 'Approved' ? 'bg-emerald-100' : existingAppStatus === 'Rejected' ? 'bg-rose-100' : 'bg-blue-100'}\`}>
            {existingAppStatus === 'Approved' ? <Check className="w-12 h-12 text-emerald-600" /> : existingAppStatus === 'Rejected' ? <X className="w-12 h-12 text-rose-600" /> : <Clock className="w-12 h-12 text-blue-600" />}
          </div>
          <h2 className="text-3xl font-black text-crhs-navy uppercase tracking-wider mb-4">
            {existingAppStatus === 'Approved' ? 'Application Approved!' : existingAppStatus === 'Rejected' ? 'Application Rejected' : 'Application Received!'}
          </h2>
          <p className="text-slate-600 font-medium text-lg max-w-lg mb-8 leading-relaxed">
            {existingAppStatus === 'Approved' 
              ? "Congratulations! Your child's admission has been approved." 
              : existingAppStatus === 'Rejected'
              ? "Unfortunately, your application was not approved at this time."
              : hasExistingApp 
              ? "You have already submitted an application. We are currently reviewing your details." 
              : "Your application has been successfully submitted. We will review your details and contact you soon."}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl mb-8">
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl flex-1">
              <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mb-2">Application Reference ID</p>
              <p className="text-2xl font-black text-crhs-navy tracking-tight">{enrollmentNo}</p>
            </div>
            {existingAppCrhsId && (
              <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-xl flex-1">
                <p className="text-sm text-emerald-700 font-bold uppercase tracking-widest mb-2">Student CRHS ID</p>
                <p className="text-3xl font-black text-emerald-900 tracking-tight">{existingAppCrhsId}</p>
              </div>
            )}
          </div>
`;

content = content.replace(/if \(hasExistingApp \|\| isSubmitted\) \{[\s\S]*?className="flex gap-4">/, uiLogic + '\n          <div className="flex gap-4">');

// Also make sure Clock and X are imported
if (!content.includes('Clock,')) {
    content = content.replace("import { Check", "import { Check, Clock, X");
}

fs.writeFileSync('src/common/components/AdmissionForm.tsx', content);
