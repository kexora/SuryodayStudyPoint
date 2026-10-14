const fs = require('fs');
let content = fs.readFileSync('src/common/pages/Dashboard.tsx', 'utf8');

// 1. Imports
if (!content.includes('collection, query, where, getDocs')) {
    content = content.replace("import { doc, updateDoc } from 'firebase/firestore';", "import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';");
}
if (!content.includes('FileText')) {
    content = content.replace("Users,", "Users, FileText, UploadCloud, Clock,");
}

// 2. State
const stateReplacement = `
  const [activeTab, setActiveTab] = useState<'personal' | 'family' | 'address' | 'quicklinks' | 'guardian'>(role === '__kx_0x5' ? 'guardian' : 'personal');
  const [userApplications, setUserApplications] = useState<any[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);

  React.useEffect(() => {
    if (role === '__kx_0x5' && user?.uid) {
      const fetchApps = async () => {
        setLoadingApps(true);
        try {
          const q = query(collection(db, 'applications'), where('userId', '==', user.uid));
          const querySnapshot = await getDocs(q);
          const apps: any[] = [];
          querySnapshot.forEach(doc => apps.push({ id: doc.id, ...doc.data() }));
          setUserApplications(apps);
        } catch (error) {
          console.error('Error fetching applications:', error);
        } finally {
          setLoadingApps(false);
        }
      };
      fetchApps();
    }
  }, [role, user?.uid]);
`;
content = content.replace("const [activeTab, setActiveTab] = useState<'personal' | 'family' | 'address' | 'quicklinks'>('personal');", stateReplacement);

// 3. Tab Button
const tabButton = `
              {role === '__kx_0x5' && (
                <button
                  onClick={() => setActiveTab('guardian')}
                  className={\`py-3.5 px-6 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 border-b-2 shrink-0 \${
                    activeTab === 'guardian'
                      ? 'border-crhs-navy text-crhs-navy bg-white shadow-sm'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }\`}
                >
                  <Users className="w-4 h-4 text-crhs-gold" /> Guardian Portal
                </button>
              )}
`;

content = content.replace("{/* Tab Bar */}\n            <div className=\"flex border-b border-slate-200 bg-slate-50/80 overflow-x-auto scrollbar-none\">", "{/* Tab Bar */}\n            <div className=\"flex border-b border-slate-200 bg-slate-50/80 overflow-x-auto scrollbar-none\">" + tabButton);

// 4. Tab Content
const tabContent = `
              {/* TAB: GUARDIAN PORTAL */}
              {activeTab === 'guardian' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h3 className="text-sm font-black uppercase tracking-wider text-crhs-navy flex items-center gap-2">
                      <Users className="w-4 h-4 text-crhs-gold" /> Guardian Portal - My Applications
                    </h3>
                    <Button 
                      size="sm" 
                      onClick={() => navigate('/admissions')}
                      className="text-xs font-bold bg-crhs-navy hover:bg-slate-800 text-white h-8"
                    >
                      + Register Child
                    </Button>
                  </div>
                  
                  {loadingApps ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
                    </div>
                  ) : userApplications.length === 0 ? (
                    <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-12 text-center space-y-4">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                        <FileText className="w-8 h-8 text-slate-300" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-700 uppercase tracking-widest">No Applications Found</h4>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        You haven't submitted any admission applications for your children yet.
                      </p>
                      <Button onClick={() => navigate('/admissions')} className="bg-crhs-navy hover:bg-slate-800 text-white font-bold px-6">
                        Start New Application
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {userApplications.map(app => (
                        <div key={app.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                          <div className={\`p-4 border-b flex justify-between items-center \${app.status === 'Approved' ? 'bg-emerald-50 border-emerald-100' : app.status === 'Rejected' ? 'bg-rose-50 border-rose-100' : 'bg-slate-50 border-slate-100'}\`}>
                            <div className="flex items-center gap-2">
                              {app.status === 'Approved' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : app.status === 'Rejected' ? <X className="w-4 h-4 text-rose-600" /> : <Clock className="w-4 h-4 text-blue-600" />}
                              <span className={\`text-xs font-bold uppercase tracking-widest \${app.status === 'Approved' ? 'text-emerald-700' : app.status === 'Rejected' ? 'text-rose-700' : 'text-blue-700'}\`}>
                                Status: {app.status || 'Pending'}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-1 rounded-md border border-slate-200 shadow-sm">
                              {app.enrollmentNo}
                            </span>
                          </div>
                          
                          <div className="p-5 flex-1 space-y-4">
                            <div>
                              <h4 className="font-black text-lg text-crhs-navy">{app.firstName} {app.lastName}</h4>
                              <p className="text-xs font-medium text-slate-500 mt-1">Class Applied: <span className="text-slate-800 font-bold">{app.classApplied || app.prevClass}</span></p>
                            </div>
                            
                            {app.status === 'Approved' && app.crhsId && (
                              <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100/50 flex items-center justify-between">
                                <div>
                                  <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-widest block mb-0.5">Official CRHS ID</span>
                                  <span className="font-black text-crhs-navy">{app.crhsId}</span>
                                </div>
                                <Award className="w-6 h-6 text-emerald-200" />
                              </div>
                            )}
                          </div>
                          
                          <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
                            <Button variant="outline" className="flex-1 text-xs font-bold border-crhs-navy text-crhs-navy hover:bg-slate-100" onClick={() => alert('Document upload is currently being processed by the administration offline. Please visit the school with original copies.')}>
                              <UploadCloud className="w-3.5 h-3.5 mr-2" /> Upload Docs
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
`;

content = content.replace("{/* TAB 1: PERSONAL DETAILS */}", tabContent + "\n              {/* TAB 1: PERSONAL DETAILS */}");

fs.writeFileSync('src/common/pages/Dashboard.tsx', content);
