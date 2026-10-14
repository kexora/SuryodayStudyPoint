import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/common/components/ui/Button';
import { ShieldAlert } from 'lucide-react';

export function Unauthorized() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 bg-slate-50">
      <ShieldAlert className="w-24 h-24 text-red-500 mb-6" />
      <h1 className="text-3xl font-black text-crhs-navy uppercase tracking-widest mb-4 text-center">
        Access Denied
      </h1>
      <p className="text-slate-600 font-medium mb-8 text-center max-w-md">
        You don't have permission to access this page. If you believe this is a mistake, please contact the administrator.
      </p>
      <Link to="/dashboard">
        <Button size="lg" className="shadow-lg uppercase tracking-widest font-bold">
          Go to Dashboard
        </Button>
      </Link>
    </div>
  );
}
