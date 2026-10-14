const fs = require('fs');
let content = fs.readFileSync('src/common/components/LoginForm.tsx', 'utf8');

const returnIndex = content.indexOf('return (');
if (returnIndex !== -1) {
    const beforeReturn = content.substring(0, returnIndex);
    
    const newReturn = `return (
    <div className="w-full">
      <div className="bg-white rounded-2xl shadow-xl border-2 border-slate-100 overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-crhs-navy via-crhs-gold to-crhs-navy"></div>
        
        {isLogin ? (
          <div className="p-8 sm:p-10">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-slate-50 border-2 border-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-crhs-navy" />
              </div>
              <h2 className="text-2xl font-black text-crhs-navy tracking-tight uppercase">User Login</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">Access the school portal securely.</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-3 animate-fade-in">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm font-bold leading-relaxed">{error}</p>
              </div>
            )}
            
            {successMessage && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-start gap-3 animate-fade-in">
                <CheckCircle className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" />
                <p className="text-sm font-bold leading-relaxed">{successMessage}</p>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-700 mb-1">
                  Email / Mobile / CRHS ID
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 bg-slate-50 border-2 border-slate-200 focus:bg-white transition-all text-sm font-bold rounded-none"
                    placeholder="Enter your ID or Email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-3 bg-slate-50 border-2 border-slate-200 focus:bg-white transition-all text-sm font-bold rounded-none"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-crhs-navy focus:ring-crhs-navy peer cursor-pointer"
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-600 group-hover:text-slate-800 transition-colors">Remember Me</span>
                </label>
                
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-xs font-black text-crhs-navy hover:text-crhs-gold transition-colors"
                >
                  Lost Password?
                </button>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-crhs-navy text-white hover:bg-slate-800 flex items-center justify-center font-bold tracking-widest text-xs uppercase shadow-xl group"
                >
                  {isLoading ? 'Authenticating...' : (
                    <>Sign In <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" /></>
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-8 text-center border-t-2 border-slate-100 pt-6">
              <p className="text-xs text-slate-500 font-medium mb-3">Don't have an account?</p>
              <Button
                type="button"
                onClick={() => setIsLogin(false)}
                className="w-full text-xs font-bold uppercase tracking-widest text-crhs-navy border-2 border-crhs-navy hover:bg-crhs-navy hover:text-white transition-all shadow-sm"
              >
                Create an Account Now
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-8 sm:p-10">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-slate-50 border-2 border-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-crhs-navy" />
              </div>
              <h2 className="text-2xl font-black text-crhs-navy tracking-tight uppercase">New Registration</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">Register as a Parent/Guardian.</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-3 animate-fade-in">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm font-bold leading-relaxed">{error}</p>
              </div>
            )}
            
            {successMessage && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-start gap-3 animate-fade-in">
                <CheckCircle className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" />
                <p className="text-sm font-bold leading-relaxed">{successMessage}</p>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-6">
              <div className="animate-fade-in space-y-6">
                <div className="border-b-2 border-crhs-gold pb-2">
                  <h3 className="text-xs font-black uppercase tracking-widest text-crhs-navy flex items-center gap-2">
                    <User className="w-4 h-4 text-crhs-gold" /> Guardian Information
                  </h3>
                </div>

                <div className="space-y-4">
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
          </div>
        )}
      </div>

      {showForgotPassword && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl relative border-2 border-crhs-navy animate-fade-in">
            <button
              onClick={() => setShowForgotPassword(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-crhs-navy rounded-full flex items-center justify-center mx-auto mb-3">
                <Key className="w-6 h-6 text-crhs-gold" />
              </div>
              <h3 className="text-xl font-black text-crhs-navy uppercase tracking-tight">Reset Password</h3>
              <p className="text-xs text-slate-500 font-medium mt-2">
                Enter your registered email address and we'll send you a link to reset your password.
              </p>
            </div>
            {forgotError && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs font-bold rounded-lg border border-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {forgotError}
              </div>
            )}
            {forgotSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                {forgotSuccess}
              </div>
            )}
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={forgotInput}
                    onChange={(e) => setForgotInput(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2.5 bg-slate-50 border-2 border-slate-200 focus:bg-white text-sm font-bold rounded-none"
                    placeholder="Enter email"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForgotPassword(false)}
                  className="flex-1 text-xs font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={forgotLoading}
                  className="flex-1 bg-crhs-navy text-white hover:bg-slate-800 text-xs uppercase font-bold"
                >
                  {forgotLoading ? 'Processing...' : 'Send Reset Link'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
`;
    content = beforeReturn + newReturn;
    fs.writeFileSync('src/common/components/LoginForm.tsx', content);
    console.log("JSX overwritten completely.");
} else {
    console.log("Could not find return statement");
}
