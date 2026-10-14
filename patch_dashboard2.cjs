const fs = require('fs');
let content = fs.readFileSync('src/common/pages/Dashboard.tsx', 'utf8');

content = content.replace("case '__kx_0x3':\n        return { label: 'Faculty / Teacher', bg: 'bg-amber-100 text-amber-900 border-amber-300' };", "case '__kx_0x3':\n        return { label: 'Faculty / Teacher', bg: 'bg-amber-100 text-amber-900 border-amber-300' };\n      case '__kx_0x5':\n        return { label: 'Parent / Guardian', bg: 'bg-indigo-100 text-indigo-900 border-indigo-300' };");

// Also let's show an "Admissions" button specifically for parents!
const admissionsLink = `
                    <Link to="/admissions" className="p-5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all space-y-2 group">
                      <div className="w-10 h-10 rounded-xl bg-crhs-navy text-crhs-gold flex items-center justify-center font-bold shadow-sm">
                        <Users className="w-5 h-5" />
                      </div>
                      <h4 className="font-black text-xs uppercase text-crhs-navy group-hover:text-crhs-gold flex items-center gap-1">
                        Apply for Admission <ExternalLink className="w-3.5 h-3.5" />
                      </h4>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        Fill out a new admission form for your child.
                      </p>
                    </Link>
`;

content = content.replace('View active admission sessions and check application form status.\n                      </p>\n                    </Link>', 'View active admission sessions and check application form status.\n                      </p>\n                    </Link>\n' + (content.includes('Apply for Admission') ? '' : admissionsLink));

fs.writeFileSync('src/common/pages/Dashboard.tsx', content);
