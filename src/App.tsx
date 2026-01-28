import { useState } from 'react';
import { Toaster } from 'sonner';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProductsPage } from './pages/ProductsPage';
import { OrdersPage } from './pages/OrdersPage';
import { DeliveryPage } from './pages/DeliveryPage';
import { CustomersPage } from './pages/CustomersPage';
import { getCurrentAdmin } from './lib/store';

type Page = 'dashboard' | 'products' | 'orders' | 'delivery' | 'customers';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(!!getCurrentAdmin());
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'products':
        return <ProductsPage />;
      case 'orders':
        return <OrdersPage />;
      case 'delivery':
        return <DeliveryPage />;
      case 'customers':
        return <CustomersPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onWidthChange={setSidebarWidth}
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
        onLogout={() => setIsAuthenticated(false)}
      />

      <div
        className="flex flex-col min-h-screen transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
        style={{ marginLeft: `${sidebarWidth}px` }}
      >
        <style>{`
          @media (max-width: 1023px) {
            .flex.flex-col.min-h-screen {
              margin-left: 0 !important;
            }
          }
        `}</style>

        <TopBar onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {renderPage()}
        </main>
      </div>

      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;
