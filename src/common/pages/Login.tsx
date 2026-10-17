import React, { useEffect } from 'react';
import { LoginForm } from '@/common/components/LoginForm';
import { useAuth } from '@/context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { SEO } from '@/common/components/ui/SEO';
import { schoolConfig } from '@/config/schoolConfig';
import { useLanguage } from '@/context/LanguageContext';

export function Login() {
  const { user, userData, role, loading } = useAuth();
  const { t, language } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && (user || userData)) {
      const isAdmin = role === '__kx_0x1' || role === '__kx_0x2';
      const defaultDest = isAdmin ? '/admin' : '/dashboard';
      const requestedFrom = (location.state as any)?.from?.pathname;
      const target = requestedFrom && requestedFrom !== '/login' ? requestedFrom : defaultDest;
      navigate(target, { replace: true });
    }
  }, [user, userData, role, loading, navigate, location.state]);

  const wasRedirected = !!(location.state as any)?.from;

  return (
    <>
      <SEO 
        title={language === 'hi' ? 'छात्र पोर्टल लॉगिन | सूर्योदय स्टडी पॉइंट' : 'Student Portal Login | Suryoday Study Point'}
        description={`Login to access ${schoolConfig.schoolName} student portal, live online classes, notes and test series.`}
      />

      <div className="min-h-[85vh] bg-slate-50 py-6 sm:py-12 px-3 sm:px-6 lg:px-8 flex flex-col justify-center relative overflow-hidden">
        {/* Subtle background abstract shapes */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-crhs-navy/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="max-w-xl mx-auto w-full space-y-6 relative z-10">
          
          {/* Access Denied / Redirect Banner if blocked */}
          {wasRedirected && (
            <div className="bg-amber-50 border-2 border-amber-400 p-4 rounded-xl flex items-start gap-3 text-amber-900 shadow-sm animate-fade-in">
              <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-black uppercase text-xs tracking-wider text-amber-900">
                  {t('auth.access_denied', 'Access Denied — Login Required')}
                </h3>
                <p className="text-xs font-semibold mt-1 text-amber-800">
                  {t('auth.login_req_msg', 'You attempted to access a protected page. Please sign in to continue.')}
                </p>
              </div>
            </div>
          )}

          {/* Login Form Component */}
          <div className="transform transition-all duration-300">
            <LoginForm />
          </div>

        </div>
      </div>
    </>
  );
}
