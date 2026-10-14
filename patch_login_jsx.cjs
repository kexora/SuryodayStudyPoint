const fs = require('fs');
let content = fs.readFileSync('src/common/components/LoginForm.tsx', 'utf8');

const startTag = '/* 2. ENHANCED REGISTRATION FORM */';
const endTag = '          )}'; // End of the form conditionally

const startIndex = content.indexOf(startTag);
const endIndex = content.indexOf(endTag, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
    const oldJsx = content.substring(startIndex, endIndex);
    
    const newJsx = '/* 2. REGISTRATION FORM (SIMPLIFIED PARENT) */\\n' +
'            <form onSubmit={handleRegisterSubmit} className="space-y-6">\\n' +
'              <div className="animate-fade-in space-y-6">\\n' +
'                <div className="border-b-2 border-crhs-gold pb-2">\\n' +
'                  <h3 className="text-xs font-black uppercase tracking-widest text-crhs-navy flex items-center gap-2">\\n' +
'                    <User className="w-4 h-4 text-crhs-gold" /> Guardian Information\\n' +
'                  </h3>\\n' +
'                </div>\\n' +
'\\n' +
'                <div className="space-y-4">\\n' +
'                  {/* Full Name */}\\n' +
'                  <div>\\n' +
'                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-700 mb-1">\\n' +
'                      Full Name <span className="text-red-500">*</span>\\n' +
'                    </label>\\n' +
'                    <input\\n' +
'                      type="text"\\n' +
'                      required\\n' +
'                      value={regData.fullName}\\n' +
'                      onChange={(e) => handleRegChange(\\\'fullName\\\', e.target.value)}\\n' +
'                      className={cn(\\n' +
'                        "block w-full px-3 py-2.5 border-2 rounded-none text-sm font-medium",\\n' +
'                        regErrors.fullName && touchedFields.fullName ? "border-red-500 bg-red-50/30" : "border-slate-200"\\n' +
'                      )}\\n' +
'                      placeholder="e.g. Rahul Kumar"\\n' +
'                    />\\n' +
'                    {regErrors.fullName && touchedFields.fullName && (\\n' +
'                      <p className="text-[11px] font-bold text-red-600 mt-1">{regErrors.fullName}</p>\\n' +
'                    )}\\n' +
'                  </div>\\n' +
'\\n' +
'                  {/* Mobile Number */}\\n' +
'                  <div>\\n' +
'                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-700 mb-1">\\n' +
'                      Mobile Number (10 Digits) <span className="text-red-500">*</span>\\n' +
'                    </label>\\n' +
'                    <input\\n' +
'                      type="tel"\\n' +
'                      required\\n' +
'                      value={regData.mobileNumber}\\n' +
'                      onChange={(e) => handleRegChange(\\\'mobileNumber\\\', e.target.value)}\\n' +
'                      className={cn(\\n' +
'                        "block w-full px-3 py-2.5 border-2 rounded-none text-sm font-medium",\\n' +
'                        regErrors.mobileNumber && touchedFields.mobileNumber ? "border-red-500 bg-red-50/30" : "border-slate-200"\\n' +
'                      )}\\n' +
'                      placeholder="9876543210"\\n' +
'                    />\\n' +
'                    {regErrors.mobileNumber && touchedFields.mobileNumber && (\\n' +
'                      <p className="text-[11px] font-bold text-red-600 mt-1">{regErrors.mobileNumber}</p>\\n' +
'                    )}\\n' +
'                  </div>\\n' +
'\\n' +
'                  {/* Email */}\\n' +
'                  <div>\\n' +
'                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-700 mb-1">\\n' +
'                      Email Address <span className="text-red-500">*</span>\\n' +
'                    </label>\\n' +
'                    <input\\n' +
'                      type="email"\\n' +
'                      required\\n' +
'                      value={regData.email}\\n' +
'                      onChange={(e) => handleRegChange(\\\'email\\\', e.target.value)}\\n' +
'                      className={cn(\\n' +
'                        "block w-full px-3 py-2.5 border-2 rounded-none text-sm font-medium",\\n' +
'                        regErrors.email && touchedFields.email ? "border-red-500 bg-red-50/30" : "border-slate-200"\\n' +
'                      )}\\n' +
'                      placeholder="e.g. rahul@example.com"\\n' +
'                    />\\n' +
'                    {regErrors.email && touchedFields.email && (\\n' +
'                      <p className="text-[11px] font-bold text-red-600 mt-1">{regErrors.email}</p>\\n' +
'                    )}\\n' +
'                  </div>\\n' +
'\\n' +
'                  {/* Password */}\\n' +
'                  <div>\\n' +
'                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-700 mb-1">\\n' +
'                      Create Password <span className="text-red-500">*</span>\\n' +
'                    </label>\\n' +
'                    <div className="relative">\\n' +
'                      <input\\n' +
'                        type={showPassword ? \\\'text\\\' : \\\'password\\\'}\\n' +
'                        required\\n' +
'                        value={regData.password}\\n' +
'                        onChange={(e) => handleRegChange(\\\'password\\\', e.target.value)}\\n' +
'                        className={cn(\\n' +
'                          "block w-full px-3 py-2.5 border-2 rounded-none text-sm font-medium",\\n' +
'                          regErrors.password && touchedFields.password ? "border-red-500 bg-red-50/30" : "border-slate-200"\\n' +
'                        )}\\n' +
'                        placeholder="Min. 6 characters"\\n' +
'                      />\\n' +
'                      <button\\n' +
'                        type="button"\\n' +
'                        onClick={() => setShowPassword(!showPassword)}\\n' +
'                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"\\n' +
'                      >\\n' +
'                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}\\n' +
'                      </button>\\n' +
'                    </div>\\n' +
'                    {regErrors.password && touchedFields.password && (\\n' +
'                      <p className="text-[11px] font-bold text-red-600 mt-1">{regErrors.password}</p>\\n' +
'                    )}\\n' +
'                  </div>\\n' +
'                </div>\\n' +
'\\n' +
'                <div className="pt-4 space-y-4">\\n' +
'                  <Button\\n' +
'                    type="submit"\\n' +
'                    disabled={isLoading}\\n' +
'                    className="w-full h-12 bg-crhs-navy text-white hover:bg-slate-800 flex items-center justify-center font-bold tracking-widest text-xs uppercase shadow-xl"\\n' +
'                  >\\n' +
'                    {isLoading ? \\\'Creating Account...\\\' : \\\'Register as Guardian\\\'}\\n' +
'                  </Button>\\n' +
'                  <Button\\n' +
'                    type="button"\\n' +
'                    onClick={() => setIsLogin(true)}\\n' +
'                    className="w-full text-xs font-bold uppercase tracking-widest text-crhs-navy border-2 border-crhs-navy hover:bg-crhs-navy hover:text-white transition-all shadow-sm"\\n' +
'                  >\\n' +
'                    Back to Sign In\\n' +
'                  </Button>\\n' +
'                </div>\\n' +
'              </div>\\n' +
'            </form>\\n';
    
    // Note: I left `\n          )}` out of newJsx intentionally if we replaced up to it. Wait, the oldJsx stops BEFORE `)}`
    content = content.replace(oldJsx, newJsx);

    // Let's also remove `currentRegStep` references if they cause errors later.
    fs.writeFileSync('src/common/components/LoginForm.tsx', content);
} else {
    console.log("Could not find delimiters");
}
