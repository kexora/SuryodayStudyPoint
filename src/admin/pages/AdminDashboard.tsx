import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/common/components/ui/Card';
import { Button } from '@/common/components/ui/Button';
import { 
  Users, 
  FileText, 
  Image as ImageIcon, 
  Bell, 
  Mail, 
  TrendingUp, 
  ShieldCheck,
  Settings,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Megaphone,
  BookOpen
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';

export function AdminDashboard() {
  const navigate = useNavigate();
  const { userData } = useAuth();
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalApplications: 0,
    pendingApplications: 0,
    activeNotices: 0,
    totalCampaigns: 0,
  });
  
  const [recentApps, setRecentApps] = useState<any[]>([]);
  const [classData, setClassData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch Users
        const usersSnap = await getDocs(collection(db, 'users'));
        const usersCount = usersSnap.size;

        // Fetch Applications
        const appsSnap = await getDocs(collection(db, 'applications'));
        let totalApps = 0;
        let pendingApps = 0;
        const appsList: any[] = [];
        const classCount: Record<string, number> = {};

        appsSnap.forEach((doc) => {
          totalApps++;
          const data = doc.data();
          if (data.status === 'Pending') pendingApps++;
          
          appsList.push({ id: doc.id, ...data });
          
          // For chart
          const className = data.classApplied || 'Unknown';
          classCount[className] = (classCount[className] || 0) + 1;
        });

        // Format chart data
        const formattedClassData = Object.keys(classCount).map(key => ({
          name: key,
          applications: classCount[key]
        })).sort((a, b) => b.applications - a.applications).slice(0, 7); // Top 7 classes

        // Sort for recent apps
        appsList.sort((a, b) => {
          const timeA = a.timestamp?.seconds || 0;
          const timeB = b.timestamp?.seconds || 0;
          return timeB - timeA;
        });

        // Fetch Notices
        const noticesSnap = await getDocs(collection(db, 'notices'));
        const noticesCount = noticesSnap.size;

        // Fetch Campaigns
        const campaignsSnap = await getDocs(collection(db, 'campaigns'));
        const campaignsCount = campaignsSnap.size;

        setStats({
          totalUsers: usersCount,
          totalApplications: totalApps,
          pendingApplications: pendingApps,
          activeNotices: noticesCount,
          totalCampaigns: campaignsCount
        });
        
        setRecentApps(appsList.slice(0, 5));
        setClassData(formattedClassData);

      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    { 
      title: 'Total Applications', 
      value: stats.totalApplications, 
      icon: FileText, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50',
      border: 'border-blue-200' 
    },
    { 
      title: 'Pending Review', 
      value: stats.pendingApplications, 
      icon: Clock, 
      color: 'text-amber-600', 
      bg: 'bg-amber-50',
      border: 'border-amber-200'
    },
    { 
      title: 'Registered Users', 
      value: stats.totalUsers, 
      icon: Users, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50',
      border: 'border-emerald-200'
    },
    { 
      title: 'Active Campaigns', 
      value: stats.totalCampaigns, 
      icon: Megaphone, 
      color: 'text-indigo-600', 
      bg: 'bg-indigo-50',
      border: 'border-indigo-200'
    },
  ];

  const quickActions = [
    { title: 'Courses & Batches', icon: BookOpen, link: '/admin/courses', desc: 'Manage courses & admissions' },
    { title: 'Family Mailer', icon: Mail, link: '/admin/communication', desc: 'Send official emails' },
    { title: 'Applications', icon: ShieldCheck, link: '/admin/applications', desc: 'Review student apps' },
    { title: 'New Notice', icon: Bell, link: '/admin/notices', desc: 'Publish announcement' },
    { title: 'Letters', icon: FileText, link: '/admin/letters', desc: 'Generate official letters' },
    { title: 'Live Alerts', icon: Bell, link: '/admin/alerts', desc: 'Push instant notifications' },
    { title: 'Settings', icon: Settings, link: '/admin/settings', desc: 'Manage website config' },
  ];

  return (
    <div className="space-y-8 pb-10 max-w-7xl mx-auto w-full">
      {/* Header Section */}
      <div className="bg-crhs-navy rounded-2xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl border-4 border-crhs-navy">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-crhs-gold/20 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-crhs-gold text-crhs-navy text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-sm mb-3">
              <TrendingUp className="w-3.5 h-3.5" /> Dashboard
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider mb-2">
              Welcome back, {userData?.name || 'Administrator'}
            </h1>
            <p className="text-sm text-slate-300 font-medium max-w-2xl leading-relaxed">
              Here is what's happening with your school today. Review pending applications, manage communications, and monitor overall system metrics.
            </p>
          </div>
          <div className="shrink-0 flex gap-3 w-full sm:w-auto">
            <Button 
              onClick={() => navigate('/admin/communication')}
              className="bg-crhs-gold text-crhs-navy hover:bg-yellow-500 font-black uppercase tracking-wider text-xs shadow-lg"
            >
              <Mail className="w-4 h-4 mr-2" /> Send Mail
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((stat, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
          >
            <Card className={`border-2 ${stat.border} shadow-sm hover:shadow-md transition-shadow`}>
            <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{stat.title}</p>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 leading-none">
                  {loading ? '...' : stat.value}
                </h3>
              </div>
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Chart & Activity */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Applications Bar Chart */}
          <Card className="border-2 border-slate-200 shadow-sm">
            <CardHeader className="border-b-2 border-slate-100 py-4 px-6 bg-slate-50">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-crhs-navy flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-crhs-gold" /> Applications by Class
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-72 w-full">
                {loading ? (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold uppercase tracking-wider text-xs">
                    Loading Chart Data...
                  </div>
                ) : classData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={classData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} />
                      <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} />
                      <RechartsTooltip 
                        cursor={{ fill: '#f1f5f9' }}
                        contentStyle={{ borderRadius: '8px', border: '2px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                      />
                      <Bar dataKey="applications" fill="#1e293b" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold uppercase tracking-wider text-xs">
                    No Application Data Available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Applications Table */}
          <Card className="border-2 border-slate-200 shadow-sm">
            <CardHeader className="border-b-2 border-slate-100 py-4 px-6 bg-slate-50 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-crhs-navy flex items-center gap-2">
                <Clock className="w-4 h-4 text-crhs-gold" /> Recent Applications
              </CardTitle>
              <Link to="/admin/applications" className="text-[10px] font-bold text-crhs-navy hover:text-crhs-gold uppercase tracking-wider flex items-center gap-1 transition-colors">
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-8 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Loading...</div>
              ) : recentApps.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {recentApps.map((app) => (
                    <div key={app.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-black text-sm uppercase shrink-0">
                          {app.firstName?.charAt(0)}{app.lastName?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-slate-900">{app.firstName} {app.lastName}</p>
                          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Class: {app.classApplied || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        {app.status === 'Approved' && <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Approved</span>}
                        {app.status === 'Rejected' && <span className="bg-rose-100 text-rose-800 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Rejected</span>}
                        {app.status === 'Pending' && <span className="bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</span>}
                        
                        <Button variant="ghost" size="sm" className="h-8 text-xs font-bold" onClick={() => navigate('/admin/applications')}>
                          Review
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">No recent applications found.</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Quick Actions & System Info */}
        <div className="space-y-6">
          
          <Card className="border-2 border-slate-200 shadow-sm">
            <CardHeader className="border-b-2 border-slate-100 py-4 px-6 bg-slate-50">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-crhs-navy flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-crhs-gold" /> Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
              {quickActions.map((action, idx) => (
                <Link key={idx} to={action.link}>
                  <div className="group border-2 border-slate-100 hover:border-crhs-navy p-3 rounded-xl flex items-center gap-3 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 group-hover:bg-crhs-navy flex items-center justify-center transition-colors shrink-0">
                      <action.icon className="w-5 h-5 text-slate-600 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-900 group-hover:text-crhs-navy transition-colors">{action.title}</p>
                      <p className="text-[10px] font-bold text-slate-500 tracking-wide uppercase">{action.desc}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card className="border-2 border-slate-200 shadow-sm">
            <CardHeader className="border-b-2 border-slate-100 py-4 px-6 bg-slate-50">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-crhs-navy flex items-center gap-2">
                <Settings className="w-4 h-4 text-crhs-gold" /> System Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Database Connection</span>
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> Online</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Storage Space</span>
                <span className="text-xs font-bold text-slate-900">Optimal</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Portal Version</span>
                <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded-sm">v2.1.0</span>
              </div>
              
              <div className="pt-4 border-t-2 border-slate-100">
                <p className="text-[10px] font-medium text-slate-400 text-center uppercase tracking-widest">
                  Secure Admin Session Active
                </p>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
