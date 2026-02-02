import { useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  IndianRupee,
  MoreVertical,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { getDashboardStats, getOrders } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';
import { useCachedData } from '@/lib/hooks';
import { CACHE_KEYS, CACHE_TTL } from '@/lib/cache';
import type { DashboardStats, Order } from '@/types';

export function DashboardPage() {
  // Use cached data for dashboard stats
  const {
    data: stats,
    isLoading: statsLoading,
    refresh: refreshStats,
    lastUpdated,
  } = useCachedData<DashboardStats>(
    useCallback(() => getDashboardStats(), []),
    CACHE_KEYS.DASHBOARD_STATS,
    CACHE_TTL.SHORT // Dashboard stats refresh more frequently
  );

  // Use cached data for recent orders
  const {
    data: allOrders,
    isLoading: ordersLoading,
    refresh: refreshOrders,
  } = useCachedData<Order[]>(
    useCallback(() => getOrders(), []),
    CACHE_KEYS.ORDERS,
    CACHE_TTL.MEDIUM
  );

  const recentOrders = allOrders?.slice(0, 5) || [];
  const isLoading = statsLoading || ordersLoading;

  const handleRefresh = async () => {
    await Promise.all([refreshStats(true), refreshOrders(true)]);
  };

  const currentStats = stats || {
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    lowStockItems: 0,
    deliveredToday: 0
  };

  const statCards = [
    {
      title: 'Total Orders',
      value: currentStats.totalOrders,
      icon: ShoppingCart,
      color: 'from-blue-500 to-blue-600',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: '+12%',
    },
    {
      title: 'Pending Orders',
      value: currentStats.pendingOrders,
      icon: AlertTriangle,
      color: 'from-amber-500 to-amber-600',
      textColor: 'text-amber-600',
      bgColor: 'bg-amber-50',
      change: '5 new',
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(currentStats.totalRevenue),
      icon: IndianRupee,
      color: 'from-emerald-500 to-emerald-600',
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      change: '+18%',
    },
    {
      title: 'Total Products',
      value: currentStats.totalProducts,
      icon: Package,
      color: 'from-purple-500 to-purple-600',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: `${currentStats.lowStockItems} low stock`,
    },
    {
      title: 'Delivered Today',
      value: currentStats.deliveredToday,
      icon: CheckCircle,
      color: 'from-teal-500 to-teal-600',
      textColor: 'text-teal-600',
      bgColor: 'bg-teal-50',
      change: 'On time',
    },
    {
      title: 'Growth',
      value: '+24%',
      icon: TrendingUp,
      color: 'from-red-500 to-red-600',
      textColor: 'text-red-600',
      bgColor: 'bg-red-50',
      change: 'This month',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-display tracking-tight">Dashboard Overview</h1>
          <p className="text-slate-500 mt-1">
            Welcome back to G-TECH Admin Panel
            {lastUpdated && (
              <span className="text-xs text-slate-400 ml-2">
                (Last updated: {lastUpdated.toLocaleTimeString()})
              </span>
            )}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all font-medium disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Loading State */}
      {isLoading && !stats && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-red-600" />
          <span className="ml-2 text-gray-600">Loading dashboard...</span>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group bg-white rounded-2xl p-6 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 border border-slate-100 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
              <stat.icon className={`w-24 h-24 ${stat.textColor}`} />
            </div>

            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-slate-500 text-sm font-medium">{stat.title}</p>
                <p className="text-3xl font-bold text-slate-900 mt-2 font-display">{stat.value}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${stat.bgColor} ${stat.textColor}`}>
                    {stat.change}
                  </span>
                  <span className="text-xs text-slate-400">vs last period</span>
                </div>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg shadow-gray-200 group-hover:scale-105 transition-transform`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recent Orders</h2>
            <p className="text-sm text-slate-500">Latest transaction history</p>
          </div>
          <button className="text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors">
            View All
          </button>
        </div>
        <div className="divide-y divide-slate-50">
          {recentOrders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-medium group-hover:bg-white group-hover:shadow-md transition-all">
                  {order.userName.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-slate-900 group-hover:text-red-600 transition-colors">{order.orderNumber}</p>
                  <p className="text-sm text-slate-500">{order.userName}</p>
                </div>
              </div>

              <div className="hidden md:block">
                <p className="text-sm font-medium text-slate-900">{order.product.name}</p>
                <p className="text-xs text-slate-400">Product</p>
              </div>

              <div className="text-right flex items-center gap-4">
                <div>
                  <p className="font-bold text-slate-900">{formatCurrency(order.totalPrice)}</p>
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold mt-0.5 ${order.status === 'delivered'
                      ? 'bg-green-100 text-green-700'
                      : order.status === 'pending'
                        ? 'bg-amber-100 text-amber-700'
                        : order.status === 'shipped'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
                <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
