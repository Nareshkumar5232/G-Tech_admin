import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { getCurrentAdmin, logoutAdmin } from '@/lib/store';
import type { Admin } from '@/types';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: any) => void;
  onWidthChange?: (width: number) => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
  onLogout: () => void;
}

export function Sidebar({
  currentPage,
  onNavigate,
  onWidthChange,
  isMobileOpen = false,
  onMobileClose,
  onLogout,
}: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [isResizing, setIsResizing] = useState(false);
  const [admin, setAdmin] = useState<Admin | null>(null);

  useEffect(() => {
    const currentAdmin = getCurrentAdmin();
    setAdmin(currentAdmin);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing && isExpanded) {
        const newWidth = e.clientX;
        if (newWidth >= 220 && newWidth <= 400) {
          setSidebarWidth(newWidth);
          onWidthChange?.(newWidth);
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = 'default';
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ew-resize';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'default';
    };
  }, [isResizing, isExpanded, onWidthChange]);

  useEffect(() => {
    const currentWidth = isExpanded ? sidebarWidth : 80;
    onWidthChange?.(currentWidth);
  }, [isExpanded, sidebarWidth, onWidthChange]);

  const handleLogout = () => {
    logoutAdmin();
    onLogout();
  };

  const navItems = [
    { label: 'Dashboard', page: 'dashboard', icon: LayoutDashboard },
    { label: 'Products', page: 'products', icon: Package },
    { label: 'Orders', page: 'orders', icon: ShoppingCart },
    { label: 'Delivery', page: 'delivery', icon: Truck },
    { label: 'Customers', page: 'customers', icon: Users },
  ];

  const collapsedWidth = 80;
  const currentWidth = isExpanded ? sidebarWidth : collapsedWidth;

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onMobileClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen glass-dark text-white transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] z-50 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{ width: `${currentWidth}px` }}
      >
        <div className="h-full flex flex-col relative overflow-hidden">
          {/* Logo */}
          <div className="px-4 py-6 border-b border-white/10">
            <button
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-3 group w-full overflow-hidden"
            >
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-red-600 rounded-xl blur opacity-40 group-hover:opacity-60 transition-opacity" />
                <div className="relative bg-gradient-to-br from-blue-600 to-blue-800 p-2.5 rounded-xl border border-blue-500/30 group-hover:scale-105 transition-transform">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <span className="text-2xl font-bold font-display">S</span>
                  </div>
                </div>
              </div>
              
              <AnimatePresence mode="wait">
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="text-left"
                  >
                    <div className="text-lg font-bold font-display tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                      SATURN
                    </div>
                    <div className="text-[10px] uppercase font-medium tracking-widest text-blue-400">Admin Panel</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto overflow-x-hidden py-6 px-3 custom-scrollbar">
            <div className="space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.page;

                return (
                  <button
                    key={item.page}
                    onClick={() => {
                      onNavigate(item.page);
                      onMobileClose?.();
                    }}
                    className={`relative w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group overflow-hidden ${
                      isActive
                        ? 'text-white'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-red-600/5 border border-red-600/20 rounded-xl"
                        initial={false}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    
                    <div className={`relative z-10 flex items-center gap-3 ${!isExpanded && 'mx-auto'}`}>
                      <Icon 
                        className={`w-5 h-5 transition-transform duration-300 ${
                          isActive ? 'text-red-500 scale-110' : 'group-hover:text-red-400 group-hover:scale-110'
                        }`} 
                      />
                      {isExpanded && (
                        <span className={`font-medium text-sm whitespace-nowrap transition-all duration-300 ${
                          isActive ? 'font-semibold' : ''
                        }`}>
                          {item.label}
                        </span>
                      )}
                    </div>

                    {/* Active Indicator Strip */}
                    {isActive && (
                      <motion.div
                        layoutId="activeStrip"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-red-500 rounded-r-full"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Admin Section */}
          <div className="border-t border-white/10 p-4 bg-black/20">
            {admin && isExpanded && (
              <div className="flex items-center gap-3 px-3 py-3 bg-white/5 border border-white/5 rounded-xl mb-3 overflow-hidden">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold shadow-lg shadow-indigo-500/20 ring-2 ring-white/10">
                  {admin.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{admin.name}</p>
                  <p className="text-xs text-slate-400 truncate">{admin.email}</p>
                </div>
              </div>
            )}

            <button
              onClick={handleLogout}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 border border-transparent transition-all ${
                !isExpanded ? 'justify-center' : ''
              }`}
            >
              <LogOut className="w-5 h-5" />
              {isExpanded && <span className="font-medium text-sm">Logout</span>}
            </button>

            {/* Collapse Button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="hidden lg:flex w-full items-center justify-center p-2 mt-2 text-slate-500 hover:text-white transition-colors"
            >
              {isExpanded ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>
          </div>

          {/* Resize Handle */}
          {isExpanded && (
            <div
              onMouseDown={() => setIsResizing(true)}
              className="hidden lg:block absolute right-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-red-500/50 transition-colors z-50 group"
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-16 bg-white/20 rounded-full group-hover:bg-red-500 transition-colors" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
