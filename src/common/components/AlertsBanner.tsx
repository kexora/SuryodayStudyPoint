import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

interface AlertsBannerProps {
  userData: any;
}

export function AlertsBanner({ userData }: AlertsBannerProps) {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    // We listen to all active alerts (you might want to filter by active status or date in a real app)
    const q = query(collection(db, 'alerts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => { console.log('Snapshot received:', snapshot.size, 'documents');
      const activeAlerts: any[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        // Simple audience filtering
        const audience = data.targetAudience || 'all';
        const userRole = userData?.role;
        const userClass = userData?.currentClass;
        
        let isVisible = false;
        // Admins see all alerts in their banner
        if (userRole === '__kx_0x1' || userRole === '__kx_0x2') isVisible = true;
        if (audience === 'all') isVisible = true;
        else if (audience === 'students' && userRole === '__kx_0x4') isVisible = true;
        else if (audience === 'teachers' && userRole === '__kx_0x3') isVisible = true;
        else if (audience === 'parents' && userData?.isParent) isVisible = true; // Assuming a flag or specific logic
        else if (audience.startsWith('class_') && audience.split('_')[1] === String(userClass)) isVisible = true;
        
        if (isVisible) {
          console.log('Alert visible for user:', {id: doc.id, audience}); activeAlerts.push({ id: doc.id, ...data });
        }
      });
      console.log('Fetched alerts:', activeAlerts); setAlerts(activeAlerts);
    }, (err) => console.error('Alerts snapshot error:', err));

    return () => unsubscribe();
  }, [userData]);

  const handleDismiss = (id: string) => {
    setDismissed([...dismissed, id]);
  };

  const visibleAlerts = alerts.filter(a => !dismissed.includes(a.id));

  if (visibleAlerts.length === 0) return null;

  return (
    <div className="space-y-3 mb-6">
      {visibleAlerts.map((alert) => {
        const isUrgent = alert.severity === 'urgent';
        const isWarning = alert.severity === 'warning';
        
        const bgClass = isUrgent ? 'bg-red-50 border-red-200 text-red-800' 
                      : isWarning ? 'bg-amber-50 border-amber-200 text-amber-800' 
                      : 'bg-blue-50 border-blue-200 text-blue-800';
                      
        const Icon = isUrgent ? AlertCircle : isWarning ? AlertTriangle : Info;

        return (
          <div key={alert.id} className={`relative p-4 border rounded-md shadow-sm flex items-start gap-3 transition-all ${bgClass}`}>
            <Icon className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-bold text-sm uppercase tracking-wider">
                {alert.title}
                {(userData?.role === '__kx_0x1' || userData?.role === '__kx_0x2') && (
                  <span className="ml-2 text-[9px] bg-white/50 px-2 py-0.5 rounded-full">
                    Target: {alert.targetAudience}
                  </span>
                )}
              </h4>
              <p className="text-sm mt-1 whitespace-pre-wrap">{alert.message}</p>
              {alert.createdAt && (
                <div className="text-[10px] uppercase font-bold mt-2 opacity-60">
                  {alert.createdAt.toDate ? alert.createdAt.toDate().toLocaleString() : 'Just now'}
                </div>
              )}
            </div>
            <button 
              onClick={() => handleDismiss(alert.id)}
              className="p-1 opacity-50 hover:opacity-100 transition-opacity"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
