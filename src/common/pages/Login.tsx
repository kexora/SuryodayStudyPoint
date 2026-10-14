import React, { useEffect } from 'react';
import { LoginForm } from '@/common/components/LoginForm';
import { useAuth } from '@/context/AuthContext';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ShieldAlert, Database, Lock, ArrowRight, CheckCircle2, ShieldX } from 'lucide-react';
import { SEO } from '@/common/components/ui/SEO';
import { schoolConfig } from '@/config/schoolConfig';

export function Login() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && user) {
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, location.state]);

  const wasRedirected = !!(location.state as any)?.from;

  return (
    <>
      <SEO 
        title="Portal Login & Security Access"
        description={`Login to access the ${schoolConfig.schoolShortName} portal and protected database.`}
      />

      <div className="min-h-[85vh] bg-slate-50 py-8 sm:py-16 px-4 sm:px-6 lg:px-8 flex flex-col justify-center relative overflow-hidden">
        {/* Subtle background abstract shapes to make it look premium */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-crhs-navy/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-crhs-gold/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="max-w-xl mx-auto w-full space-y-8 relative z-10">
          
          {/* Access Denied / Redirect Banner if blocked */}
          {wasRedirected && (
            <div className="bg-amber-50 border-2 border-amber-400 p-4 rounded-none flex items-start gap-3 text-amber-900 shadow-sm animate-fade-in">
              <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-black uppercase text-xs tracking-wider text-amber-900">
                  Access Denied — Login Required
                </h3>
                <p className="text-xs font-semibold mt-1 text-amber-800">
                  You attempted to access <code className="bg-amber-100 px-1.5 py-0.5 text-amber-900 font-mono text-[11px]">{(location.state as any)?.from?.pathname || 'a protected page'}</code> without logging in.
                </p>
              </div>
            </div>
          )}

          {/* Login Form Container */}
          <div className="transform transition-all duration-500 hover:shadow-2xl">
            <LoginForm />
          </div>

        </div>
      </div>
    </>
  );
}

