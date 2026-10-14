import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/common/components/ui/Button';
import { Navigate } from 'react-router-dom';
import { AlertsBanner } from '@/common/components/AlertsBanner';

export function StudentDashboard() {
  const { user, userData, signOut, loading } = useAuth();

  if (loading) {
    return <div className="p-20 text-center">Loading...</div>;
  }

  // If role is admin, might want to redirect to /admin automatically, but let's just provide a link
  if (userData?.role === '__kx_0x2' || userData?.role === '__kx_0x1') {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 shadow-md border-t-4 border-crhs-navy">
        <h1 className="text-3xl font-black text-crhs-navy mb-4">Welcome to your Portal</h1>
        <AlertsBanner userData={userData} />
        <p className="text-slate-600 mb-8">
          Logged in as: <strong>{user?.email}</strong> <br/>
          Role: <strong className="uppercase">{userData?.role === '__kx_0x4' ? 'Student' : userData?.role === '__kx_0x3' ? 'Teacher' : 'Administrator'}</strong>
        </p>

        {userData?.role === '__kx_0x4' && (
          <div className="bg-blue-50 p-6 rounded-md mb-8 border border-blue-100">
            <h2 className="font-bold text-blue-800 mb-2">Student Dashboard</h2>
            <p className="text-sm text-blue-600">Here you can view your grades, attendance, and upcoming assignments.</p>
          </div>
        )}

        {userData?.role === '__kx_0x3' && (
          <div className="bg-amber-50 p-6 rounded-md mb-8 border border-amber-100">
            <h2 className="font-bold text-amber-800 mb-2">Teacher Dashboard</h2>
            <p className="text-sm text-amber-600">Here you can manage classes, input grades, and track student progress.</p>
          </div>
        )}

        <Button onClick={signOut} variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
          Sign Out
        </Button>
      </div>
    </div>
  );
}
