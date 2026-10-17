import { schoolConfig } from "@/config/schoolConfig";
import React, { useState, useRef } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Users, 
  Settings, 
  LayoutDashboard, 
  ChevronDown, 
  ShieldCheck,
  Sparkles, Mail
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { SEO } from '@/common/components/ui/SEO';
import { useAuth } from '@/context/AuthContext';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';
import { cn } from '@/lib/utils';
import { AlertsBanner } from '@/common/components/AlertsBanner';

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { userData } = useAuth();
  
  const isSuperAdmin = userData?.role === '__kx_0x1';
  const isAdmin = userData?.role === '__kx_0x2';

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [hidden, setHidden] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() || 0;
    if (latest > previous && latest > 80) {
      setHidden(true);
      setActiveDropdown(null);
    } else {
      setHidden(false);
    }
  });
  const navContainerRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(navContainerRef, () => {
    setActiveDropdown(null);
  });

  const buildNavItems = () => {
    const items = [];
    items.push({ name: 'Dashboard', path: '/admin', icon: LayoutDashboard });
    if (isAdmin || isSuperAdmin) {
      items.push({ name: 'Communication', path: '/admin/communication', icon: Mail });
    }
    if (isSuperAdmin) {
      items.push({ name: 'Users', path: '/admin/users', icon: ShieldCheck });
    }


    
    if (isAdmin || isSuperAdmin) {
      const admissionSub = [];
      admissionSub.push({ name: 'Applications', path: '/admin/applications' });
      admissionSub.push({ name: 'Course Admissions', path: '/admin/courses' });
      if (isSuperAdmin) {
        admissionSub.push({ name: 'Campaigns', path: '/admin/campaigns' });
      }
      
      items.push({ name: 'Admissions', icon: Users, subItems: admissionSub });
    }
    
    items.push({
      name: 'Content',
      icon: FileText,
      subItems: [
        { name: 'Courses & Academics', path: '/admin/courses' },
        { name: 'Gallery', path: '/admin/gallery' },
        { name: 'Notices', path: '/admin/notices' },
        { name: 'Hero Banners', path: '/admin/hero-banners' },
        { name: 'Letters', path: '/admin/letters' },
        { name: 'Live Alerts', path: '/admin/alerts' },
      ]
    });
    
    if (isSuperAdmin) {
      items.push({ 
        name: 'Settings', 
        icon: Settings,
        subItems: [
          { name: 'Website', path: '/admin/settings' },
          { name: 'Technical', path: '/admin/technical-settings' }
        ]
      });
    }
    
    return items;
  };

  const navItems = buildNavItems();

  const handleItemClick = (item: any) => {
    if (item.subItems && item.subItems.length > 0) {
      setActiveDropdown(prev => prev === item.name ? null : item.name);
    } else if (item.path) {
      setActiveDropdown(null);
      navigate(item.path);
    }
  };

  const handleSubItemClick = (path: string) => {
    setActiveDropdown(null);
    navigate(path);
  };

  // Find active parent item if any
  const getActiveSubName = (subItems?: Array<{ name: string; path: string }>) => {
    if (!subItems) return null;
    const matched = subItems.find(sub => sub.path === location.pathname);
    return matched ? matched.name : null;
  };

  return (
    <>
      <SEO 
        title="Admin Portal" 
        description={`${schoolConfig.schoolShortName} Administration Dashboard.`}
      />

      <div className="bg-slate-50 min-h-screen w-full relative pb-12">
        {/* Floating Navigation Header with Dropdown */}
        <motion.div 
          variants={{
            visible: { y: 0, opacity: 1 },
            hidden: { y: -100, opacity: 0 }
          }}
          animate={hidden ? "hidden" : "visible"}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="sticky top-[68px] sm:top-[76px] z-40 py-2 sm:py-3 px-2 sm:px-6 w-full flex flex-col items-center pointer-events-none"
        >
          <div 
            ref={navContainerRef}
            className="pointer-events-auto flex flex-col items-center gap-2 max-w-[calc(100vw-1rem)] sm:max-w-full"
          >
            {/* Main Pill Bar */}
            <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xl rounded-full p-1.5 flex items-center gap-1 sm:gap-2 max-w-full overflow-x-auto touch-pan-x no-scrollbar transition-all">
              {/* Admin Badge */}
              <div className="flex items-center gap-1.5 bg-crhs-navy text-crhs-gold font-extrabold text-[11px] sm:text-xs uppercase tracking-wider px-3 py-1.5 rounded-full shrink-0 shadow-sm select-none">
                <ShieldCheck className="w-3.5 h-3.5 text-crhs-gold" />
                <span>Admin</span>
              </div>

              <div className="h-4 w-px bg-slate-200 mx-0.5 shrink-0" />

              {/* Nav Pill Items */}
              <div className="flex items-center gap-1 shrink-0">
                {navItems.map((item) => {
                  const hasSubItems = item.subItems && item.subItems.length > 0;
                  const isDirectActive = item.path === location.pathname;
                  const activeSubName = getActiveSubName(item.subItems);
                  const isParentActive = !!activeSubName;
                  const isDropdownOpen = activeDropdown === item.name;
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => handleItemClick(item)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer select-none",
                        (isDirectActive || isParentActive)
                          ? "bg-crhs-navy text-white shadow-md"
                          : isDropdownOpen
                          ? "bg-slate-200 text-crhs-navy font-bold shadow-inner"
                          : "text-slate-600 hover:bg-slate-100 hover:text-crhs-navy"
                      )}
                    >
                      <Icon className={cn(
                        "w-4 h-4 shrink-0 transition-transform duration-200",
                        (isDirectActive || isParentActive) ? "text-crhs-gold" : "text-slate-400"
                      )} />
                      <span>{item.name}</span>

                      {isParentActive && (
                        <span className="ml-1 bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                          {activeSubName}
                        </span>
                      )}

                      {hasSubItems && (
                        <ChevronDown className={cn(
                          "w-3.5 h-3.5 transition-transform duration-200",
                          isDropdownOpen ? "rotate-180 text-crhs-navy font-bold" : (isParentActive ? "text-white/80" : "text-slate-400")
                        )} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submenu Floating Card - Rendered OUTSIDE overflow-x-auto container */}
            <AnimatePresence>
              {activeDropdown && (() => {
                const activeItem = navItems.find(i => i.name === activeDropdown);
                if (!activeItem || !activeItem.subItems) return null;

                return (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-2xl rounded-2xl p-2 z-50 flex flex-wrap sm:flex-nowrap items-center gap-1.5 max-w-full overflow-x-auto touch-pan-x no-scrollbar"
                  >
                    <div className="px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 shrink-0">
                      {activeItem.name}:
                    </div>
                    <div className="flex items-center gap-1.5">
                      {activeItem.subItems.map((sub) => {
                        const isSubActive = location.pathname === sub.path;
                        return (
                          <button
                            key={sub.path}
                            type="button"
                            onClick={() => handleSubItemClick(sub.path)}
                            className={cn(
                              "px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer shadow-sm",
                              isSubActive
                                ? "bg-crhs-navy text-white shadow-md"
                                : "bg-slate-100/90 text-slate-700 hover:bg-slate-200 hover:text-crhs-navy"
                            )}
                          >
                            <span>{sub.name}</span>
                            {isSubActive && <Sparkles className="w-3.5 h-3.5 text-crhs-gold shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                );
              })()}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Main Content View */}
        <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-2 sm:pt-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, filter: 'blur(10px)' }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <AlertsBanner userData={userData} />
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </>
  );
}

