import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
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
  BookOpen,
  Sparkles,
  RefreshCw,
  Eye,
  Plus,
  Send,
  Calendar,
  Layers,
  GraduationCap,
  ExternalLink,
  ChevronRight,
  Activity
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { schoolConfig } from '@/config/schoolConfig';

// Status colors and badges
const STATUS_STYLES: Record<string, { bg: string; text: string; border: string; icon: React.ElementType }> = {
  Approved: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    icon: CheckCircle2,
  },
  Pending: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-700',
    border: 'border-amber-200',
    icon: Clock,
  },
  Rejected: {
    bg: 'bg-rose-500/10',
    text: 'text-rose-700',
    border: 'border-rose-200',
    icon: AlertCircle,
  },
};

export function AdminDashboard() {
  const navigate = useNavigate();
  const { userData } = useAuth();
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    activeNotices: 0,
    totalCourses: 0,
    totalCampaigns: 0,
  });
  
  const [recentApps, setRecentApps] = useState<any[]>([]);
  const [classData, setClassData] = useState<any[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved'>('all');

  const fetchDashboardData = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    else setLoading(true);

    try {
      // 1. Fetch Users
      const usersSnap = await getDocs(collection(db, 'users'));
      const usersCount = usersSnap.size;

      // 2. Fetch Courses
      const coursesSnap = await getDocs(collection(db, 'courses'));
      const coursesCount = coursesSnap.size;

      // 3. Fetch Applications
      const appsSnap = await getDocs(collection(db, 'applications'));
      let totalApps = 0;
      let pendingApps = 0;
      let approvedApps = 0;
      let rejectedApps = 0;
      const appsList: any[] = [];
      const classCount: Record<string, number> = {};

      appsSnap.forEach((doc) => {
        totalApps++;
        const data = doc.data();
        const status = data.status || 'Pending';
        if (status === 'Pending') pendingApps++;
        else if (status === 'Approved') approvedApps++;
        else if (status === 'Rejected') rejectedApps++;
        
        appsList.push({ id: doc.id, ...data });
        
        // Group for class chart
        const className = data.classApplied || 'General Admission';
        classCount[className] = (classCount[className] || 0) + 1;
      });

      // Format bar chart data
      const formattedClassData = Object.keys(classCount).map(key => ({
        name: key.length > 14 ? key.substring(0, 12) + '…' : key,
        fullName: key,
        applications: classCount[key]
      })).sort((a, b) => b.applications - a.applications).slice(0, 6);

      // Status distribution for pie summary
      const formattedStatus = [
        { name: 'Pending', value: pendingApps || (totalApps === 0 ? 0 : 0), color: '#f59e0b' },
        { name: 'Approved', value: approvedApps, color: '#10b981' },
        { name: 'Rejected', value: rejectedApps, color: '#f43f5e' },
      ].filter(item => item.value > 0);

      // Sort recent applications by timestamp
      appsList.sort((a, b) => {
        const timeA = a.timestamp?.seconds || (a.createdAt ? new Date(a.createdAt).getTime() / 1000 : 0);
        const timeB = b.timestamp?.seconds || (b.createdAt ? new Date(b.createdAt).getTime() / 1000 : 0);
        return timeB - timeA;
      });

      // 4. Fetch Notices
      const noticesSnap = await getDocs(collection(db, 'notices'));
      const noticesCount = noticesSnap.size;

      // 5. Fetch Campaigns
      const campaignsSnap = await getDocs(collection(db, 'campaigns'));
      const campaignsCount = campaignsSnap.size;

      setStats({
        totalUsers: usersCount,
        totalApplications: totalApps,
        pendingApplications: pendingApps,
        approvedApplications: approvedApps,
        activeNotices: noticesCount,
        totalCourses: coursesCount,
        totalCampaigns: campaignsCount,
      });
      
      setRecentApps(appsList);
      setClassData(formattedClassData);
      setStatusDistribution(formattedStatus);

    } catch (err) {
      console.error("Error fetching dashboard metrics:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Filtered applications based on active tab
  const filteredApps = recentApps.filter(app => {
    if (activeTab === 'pending') return app.status === 'Pending';
    if (activeTab === 'approved') return app.status === 'Approved';
    return true;
  }).slice(0, 6);

  // High impact metrics
  const metricCards = [
    { 
      title: 'Total Applications', 
      value: stats.totalApplications, 
      subtext: `${stats.pendingApplications} awaiting review`,
      icon: FileText, 
      color: 'text-blue-600', 
      bg: 'bg-blue-500/10',
      border: 'border-blue-100 hover:border-blue-300',
      action: '/admin/applications',
    },
    { 
      title: 'Pending Review', 
      value: stats.pendingApplications, 
      subtext: 'Needs administrator action',
      icon: Clock, 
      color: 'text-amber-600', 
      bg: 'bg-amber-500/10',
      border: 'border-amber-100 hover:border-amber-300',
      action: '/admin/applications',
      highlight: stats.pendingApplications > 0,
    },
    { 
      title: 'Registered Users', 
      value: stats.totalUsers, 
      subtext: 'Students & verified accounts',
      icon: Users, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-100 hover:border-emerald-300',
      action: '/admin/users',
    },
    { 
      title: 'Live Courses & Batches', 
      value: stats.totalCourses, 
      subtext: 'Academic, Foundation & Computer',
      icon: BookOpen, 
      color: 'text-indigo-600', 
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-100 hover:border-indigo-300',
      action: '/admin/courses',
    },
  ];

  // Quick Action Station
  const quickActions = [
    { 
      title: 'Course Batches', 
      icon: BookOpen, 
      link: '/admin/courses', 
      desc: 'Create & edit course admissions',
      accent: 'text-amber-600 bg-amber-500/10 border-amber-200/60'
    },
    { 
      title: 'Review Applications', 
      icon: FileText, 
      link: '/admin/applications', 
      desc: 'Process student applications',
      accent: 'text-blue-600 bg-blue-500/10 border-blue-200/60'
    },
    { 
      title: 'Broadcast Mailer', 
      icon: Mail, 
      link: '/admin/communication', 
      desc: 'Send emails to all students',
      accent: 'text-purple-600 bg-purple-500/10 border-purple-200/60'
    },
    { 
      title: 'Notice Board', 
      icon: Bell, 
      link: '/admin/notices', 
      desc: 'Publish urgent notices & news',
      accent: 'text-rose-600 bg-rose-500/10 border-rose-200/60'
    },
    { 
      title: 'User Management', 
      icon: ShieldCheck, 
      link: '/admin/users', 
      desc: 'Roles, students & admin accounts',
      accent: 'text-emerald-600 bg-emerald-500/10 border-emerald-200/60'
    },
    { 
      title: 'Photo Gallery', 
      icon: Layers, 
      link: '/admin/gallery', 
      desc: 'Upload campus & event images',
      accent: 'text-cyan-600 bg-cyan-500/10 border-cyan-200/60'
    },
    { 
      title: 'Push Alerts', 
      icon: Megaphone, 
      link: '/admin/alerts', 
      desc: 'Instant banner notifications',
      accent: 'text-amber-700 bg-amber-500/15 border-amber-300/70'
    },
    { 
      title: 'Portal Settings', 
      icon: Settings, 
      link: '/admin/settings', 
      desc: 'Address, fees, contact & config',
      accent: 'text-slate-700 bg-slate-500/10 border-slate-200'
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 pb-12 max-w-7xl mx-auto w-full px-2 sm:px-4">
      
      {/* Executive Hero Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative bg-gradient-to-br from-crhs-navy via-slate-900 to-slate-950 rounded-3xl p-5 sm:p-8 text-white overflow-hidden shadow-xl border border-slate-800"
      >
        {/* Ambient background glows */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-2">
            {/* Top kicker */}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1 text-amber-400 font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Admin Command Center</span>
              </span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-slate-400">Session 2026–27</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Sync
              </span>
            </div>

            {/* Main Welcome Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white">
              Welcome back, {userData?.name || userData?.fullName || 'Administrator'}
            </h1>

            {/* Subtitle description */}
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-normal leading-relaxed">
              Real-time administrative control for {schoolConfig.schoolName}. Manage applications, broadcast announcements, review student records, and oversee academic courses.
            </p>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0 flex-wrap">
            <button
              onClick={() => fetchDashboardData(true)}
              disabled={isRefreshing}
              aria-label="Refresh dashboard metrics"
              className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10 hover:border-white/20 text-xs font-semibold flex items-center gap-2 transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
              <span>{isRefreshing ? 'Refreshing…' : 'Refresh'}</span>
            </button>

            <Link
              to="/admin/communication"
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Broadcast</span>
            </Link>

            <Link
              to="/admin/courses"
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-amber-600" />
              <span>New Batch</span>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Metrics Row with Staggered Blur Reveal */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {metricCards.map((metric, idx) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.4, delay: 0.08 * idx, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link to={metric.action} className="block group">
              <div className={`p-4 sm:p-5 rounded-2xl bg-white border ${metric.border} shadow-xs hover:shadow-md transition-all relative overflow-hidden h-full flex flex-col justify-between`}>
                
                {/* Subtle highlight bar if attention needed */}
                {metric.highlight && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />
                )}

                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900 transition-colors">
                    {metric.title}
                  </span>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${metric.bg} ${metric.color} transition-transform group-hover:scale-105`}>
                    <metric.icon className="w-4 h-4" />
                  </div>
                </div>

                <div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {loading ? (
                      <span className="inline-block w-12 h-7 bg-slate-200 animate-pulse rounded-md" />
                    ) : (
                      metric.value
                    )}
                  </div>
                  <p className="text-[11px] font-medium text-slate-500 mt-1 line-clamp-1">
                    {metric.subtext}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-400 group-hover:text-amber-600 transition-colors">
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid: Charts + Activity + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        
        {/* Left Column: Analytics & Applications (8 cols) */}
        <div className="lg:col-span-8 space-y-6 sm:space-y-8">
          
          {/* Applications Analytics Chart */}
          <motion.div
            initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.45, delay: 0.2 }}
            className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden"
          >
            <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
                    <Activity className="w-4 h-4" />
                  </div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                    Applications by Class & Course
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  Breakdown of student admissions across courses and target sessions
                </p>
              </div>

              {/* Status Indicators */}
              <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-slate-900 inline-block" />
                  <span>Applications</span>
                </span>
                <span aria-hidden="true">·</span>
                <span className="text-slate-600 font-bold">{stats.totalApplications} Total</span>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <div className="h-64 sm:h-72 w-full">
                {loading ? (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
                    <span className="text-xs font-semibold">Loading class distribution…</span>
                  </div>
                ) : classData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={classData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} 
                      />
                      <YAxis 
                        allowDecimals={false} 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} 
                      />
                      <RechartsTooltip 
                        cursor={{ fill: '#f8fafc' }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-slate-900 text-white px-3 py-2 rounded-xl text-xs shadow-xl border border-slate-800">
                                <p className="font-bold">{data.fullName}</p>
                                <p className="text-amber-400 font-medium mt-0.5">
                                  {data.applications} Applications Received
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar 
                        dataKey="applications" 
                        fill="#0f172a" 
                        radius={[6, 6, 2, 2]} 
                        barSize={32}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                    <FileText className="w-8 h-8 text-slate-300 mb-2" />
                    <p className="font-bold text-slate-600">No application submissions yet</p>
                    <p className="text-slate-400 mt-0.5">Submitted forms will automatically generate graphs here</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Recent Applications Feed with Filter Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.45, delay: 0.28 }}
            className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden"
          >
            <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                    Recent Applications
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  Review student admission requests and change applicant statuses
                </p>
              </div>

              {/* Segmented Filter Control */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl self-start sm:self-auto">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    activeTab === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({recentApps.length})
                </button>
                <button
                  onClick={() => setActiveTab('pending')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    activeTab === 'pending' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Pending ({stats.pendingApplications})
                </button>
                <button
                  onClick={() => setActiveTab('approved')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    activeTab === 'approved' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Approved ({stats.approvedApplications})
                </button>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {loading ? (
                <div className="p-8 text-center text-xs font-semibold text-slate-400 flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
                  <span>Loading applications…</span>
                </div>
              ) : filteredApps.length > 0 ? (
                filteredApps.map((app) => {
                  const statusKey = app.status || 'Pending';
                  const style = STATUS_STYLES[statusKey] || STATUS_STYLES.Pending;
                  const StatusIcon = style.icon;

                  return (
                    <div 
                      key={app.id} 
                      className="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4"
                    >
                      <div className="flex items-start sm:items-center gap-3.5">
                        {/* Applicant Initial Avatar */}
                        <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-black text-sm uppercase shrink-0 shadow-xs">
                          {(app.firstName || app.studentName || 'S').charAt(0)}
                          {(app.lastName || '').charAt(0)}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-sm text-slate-900">
                              {app.firstName ? `${app.firstName} ${app.lastName || ''}` : (app.studentName || 'Student Applicant')}
                            </p>
                            {app.mobileNumber && (
                              <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                                · {app.mobileNumber}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 flex-wrap">
                            <span className="font-medium text-slate-700">
                              {app.classApplied || app.courseApplied || 'Class Admission'}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>{app.district || app.villageTown || 'Local'}</span>
                            {app.createdAt && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="text-slate-400 text-[11px]">
                                  {new Date(app.createdAt).toLocaleDateString()}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        {/* Status Tag */}
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${style.bg} ${style.text} ${style.border}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          <span>{statusKey}</span>
                        </span>

                        {/* Action link */}
                        <Link
                          to="/admin/applications"
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-200/60 transition-colors flex items-center gap-1"
                        >
                          <span>Review</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-10 text-center text-xs text-slate-500 font-medium">
                  <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-bold text-slate-700">No applications found in this tab</p>
                  <p className="text-slate-400 mt-0.5">Switch filter to 'All' or check back later</p>
                </div>
              )}
            </div>

            {/* Bottom Footer Link */}
            <div className="p-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600 px-5">
              <span>Showing {filteredApps.length} of {recentApps.length} total applications</span>
              <Link
                to="/admin/applications"
                className="text-amber-700 hover:text-amber-900 font-bold inline-flex items-center gap-1 hover:underline"
              >
                <span>Open Full Applications Table</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>

        </div>

        {/* Right Column: Quick Action Station & Portal Diagnostics (4 cols) */}
        <div className="lg:col-span-4 space-y-6 sm:space-y-8">
          
          {/* Quick Action Station */}
          <motion.div
            initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.45, delay: 0.24 }}
            className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 sm:p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  Quick Actions
                </h3>
              </div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Shortcuts
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
              {quickActions.map((action) => (
                <Link
                  key={action.title}
                  to={action.link}
                  className="group p-3 rounded-2xl border border-slate-100 hover:border-slate-300 bg-white hover:bg-slate-50/70 transition-all flex items-center gap-3 shadow-2xs hover:shadow-xs"
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-105 ${action.accent}`}>
                    <action.icon className="w-4 h-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-amber-700 transition-colors truncate">
                      {action.title}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium truncate">
                      {action.desc}
                    </p>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Institution Snapshot & System Health */}
          <motion.div
            initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.45, delay: 0.32 }}
            className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 sm:p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                System & Portal Status
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="font-semibold text-slate-500">Database Connection</span>
                <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Active Firestore
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="font-semibold text-slate-500">Active Academic Session</span>
                <span className="font-bold text-slate-900">
                  2026–27
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="font-semibold text-slate-500">Notice Board Alerts</span>
                <span className="font-bold text-slate-900">
                  {stats.activeNotices} Published
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="font-semibold text-slate-500">Coaching Campus</span>
                <span className="font-bold text-slate-900 text-right truncate max-w-[150px]">
                  Bhawani Chhapar
                </span>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="font-semibold text-slate-500">Helpline Contact</span>
                <span className="font-mono font-bold text-slate-800">
                  {schoolConfig.contact.phonePrimary}
                </span>
              </div>
            </div>

            <div className="mt-5 p-3 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-[11px] text-amber-900 leading-relaxed">
              <span className="font-bold">Admin Notice: </span>
              New applications and course updates reflect instantly across the student portal and mobile views.
            </div>
          </motion.div>

        </div>

      </div>

    </div>
  );
}
