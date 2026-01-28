import { Menu, Bell, Search, User, Settings } from 'lucide-react';

interface TopBarProps {
  onMobileMenuToggle?: () => void;
}

export function TopBar({ onMobileMenuToggle }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 glass w-full">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
        {/* Mobile Menu Button */}
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden mr-3 text-slate-700 p-2 hover:bg-slate-100 rounded-lg transition-all"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search */}
        <div className="flex-1 max-w-xl">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-red-500 transition-colors" />
            <input
              type="text"
              placeholder="Search products, orders..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500/50 transition-all text-sm"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-4">
          <button className="p-2 hover:bg-slate-100/80 rounded-lg transition-all text-slate-600 hover:text-slate-900">
            <Settings className="w-5 h-5" />
          </button>

          <button className="relative p-2 hover:bg-slate-100/80 rounded-lg transition-all text-slate-600 hover:text-slate-900">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
          </button>

          <div className="h-8 w-px bg-slate-200 mx-2" />

          <button className="flex items-center gap-2 p-1.5 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
              <User className="w-4 h-4 text-slate-600" />
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
