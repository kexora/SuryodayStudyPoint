const fs = require('fs');
let content = fs.readFileSync('src/common/components/LoginForm.tsx', 'utf8');

// The issue was I inserted literal '\n' instead of real newlines, and literal '\''.
// Let's replace the corrupted part.
// The corrupted part starts at `/* 2. REGISTRATION FORM (SIMPLIFIED PARENT) */\n`

const badStart = content.indexOf('/* 2. REGISTRATION FORM (SIMPLIFIED PARENT) */\\n');
if (badStart !== -1) {
    const badEnd = content.indexOf('</form>\\n', badStart) + 9;
    
    // Create the correct string
    const correctString = `
            /* 2. REGISTRATION FORM (SIMPLIFIED PARENT) */
            <form onSubmit={handleRegisterSubmit} className="space-y-6">
              <div className="animate-fade-in space-y-6">
                <div className="border-b-2 border-crhs-gold pb-2">
                  <h3 className="text-xs font-black uppercase tracking-widest text-crhs-navy flex items-center gap-2">
                    <User className="w-4 h-4 text-crhs-gold" /> Guardian Information
                  </h3>
                </div>

                <div className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={regData.fullName}
                      onChange={(e) => handleRegChange('fullName', e.target.value)}
                      className={cn(
                        "block w-full px-3 py-2.5 border-2 rounded-none text-sm font-medium",
                        regErrors.fullName && touchedFields.fullName ? "border-red-500 bg-red-50/30" : "border-slate-200"
                      )}
                      placeholder="e.g. Rahul Kumar"
                    />
                    {regErrors.fullName && touchedFields.fullName && (
                      <p className="text-[11px] font-bold text-red-600 mt-1">{regErrors.fullName}</p>
                    )}
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-700 mb-1">
                      Mobile Number (10 Digits) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={regData.mobileNumber}
                      onChange={(e) => handleRegChange('mobileNumber', e.target.value)}
                      className={cn(
                        "block w-full px-3 py-2.5 border-2 rounded-none text-sm font-medium",
                        regErrors.mobileNumber && touchedFields.mobileNumber ? "border-red-500 bg-red-50/30" : "border-slate-200"
                      )}
                      placeholder="9876543210"
                    />
                    {regErrors.mobileNumber && touchedFields.mobileNumber && (
                      <p className="text-[11px] font-bold text-red-600 mt-1">{regErrors.mobileNumber}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={regData.email}
                      onChange={(e) => handleRegChange('email', e.target.value)}
                      className={cn(
                        "block w-full px-3 py-2.5 border-2 rounded-none text-sm font-medium",
                        regErrors.email && touchedFields.email ? "border-red-500 bg-red-50/30" : "border-slate-200"
                      )}
                      placeholder="e.g. rahul@example.com"
                    />
                    {regErrors.email && touchedFields.email && (
                      <p className="text-[11px] font-bold text-red-600 mt-1">{regErrors.email}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-700 mb-1">
                      Create Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={regData.password}
                        onChange={(e) => handleRegChange('password', e.target.value)}
                        className={cn(
                          "block w-full px-3 py-2.5 border-2 rounded-none text-sm font-medium",
                          regErrors.password && touchedFields.password ? "border-red-500 bg-red-50/30" : "border-slate-200"
                        )}
                        placeholder="Min. 6 characters"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {regErrors.password && touchedFields.password && (
                      <p className="text-[11px] font-bold text-red-600 mt-1">{regErrors.password}</p>
                    )}
                  </div>
                </div>

                <div className="pt-4 space-y-4">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-crhs-navy text-white hover:bg-slate-800 flex items-center justify-center font-bold tracking-widest text-xs uppercase shadow-xl"
                  >
                    {isLoading ? 'Creating Account...' : 'Register as Guardian'}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setIsLogin(true)}
                    className="w-full text-xs font-bold uppercase tracking-widest text-crhs-navy border-2 border-crhs-navy hover:bg-crhs-navy hover:text-white transition-all shadow-sm"
                  >
                    Back to Sign In
                  </Button>
                </div>
              </div>
            </form>
`;
    content = content.substring(0, badStart) + correctString + content.substring(badEnd);
    fs.writeFileSync('src/common/components/LoginForm.tsx', content);
    console.log("Fixed corrupted string.");
} else {
    console.log("Could not find the bad string.");
}
