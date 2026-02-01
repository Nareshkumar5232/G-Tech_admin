import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Eye, Filter, X } from 'lucide-react';
import { getOrders, updateOrderStatus } from '@/lib/store';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { toast } from 'sonner';
import type { Order } from '@/types';

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<Order['status'] | 'all'>('all');
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  const fetchOrders = async () => {
    const fetchedOrders = await getOrders();
    setOrders(fetchedOrders || []);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
    // Search filter
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.userName.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    // Amount filter
    const min = minAmount ? parseFloat(minAmount) : 0;
    const max = maxAmount ? parseFloat(maxAmount) : Infinity;
    const matchesAmount = order.totalPrice >= min && order.totalPrice <= max;
    
    return matchesSearch && matchesStatus && matchesAmount;
  });

  const clearFilters = () => {
    setStatusFilter('all');
    setMinAmount('');
    setMaxAmount('');
    setSearchQuery('');
  };

  const hasActiveFilters = statusFilter !== 'all' || minAmount !== '' || maxAmount !== '';

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    const trackingNumber = newStatus === 'shipped' ? `TRK${Date.now()}` : undefined;
    await updateOrderStatus(orderId, newStatus, trackingNumber);
    await fetchOrders();
    toast.success(`Order status updated to ${newStatus}`);
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'confirmed': return 'bg-blue-100 text-blue-700';
      case 'shipped': return 'bg-purple-100 text-purple-700';
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage and track customer orders</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex gap-3 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order number or customer name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
              hasActiveFilters 
                ? 'bg-red-600 text-white border-red-600' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="bg-white text-red-600 text-xs px-1.5 py-0.5 rounded-full font-medium">
                Active
              </span>
            )}
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as Order['status'] | 'all')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Min Amount Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Min Amount</label>
                <input
                  type="number"
                  placeholder="0"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Max Amount Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Amount</label>
                <input
                  type="number"
                  placeholder="No limit"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <div className="mt-3 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.map((order, index) => (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{order.orderNumber}</p>
                      <p className="text-sm text-gray-500">Qty: {order.quantity}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{order.userName}</p>
                      <p className="text-sm text-gray-500">{order.userEmail}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900">{order.product.name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-900">{formatCurrency(order.totalPrice)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600">{formatDateTime(order.createdAt)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value as Order['status'])}
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
                    >
                      <option value="pending">PENDING</option>
                      <option value="confirmed">CONFIRMED</option>
                      <option value="shipped">SHIPPED</option>
                      <option value="delivered">DELIVERED</option>
                      <option value="cancelled">CANCELLED</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white rounded-xl max-w-2xl w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">Order Details</h3>
            <div className="space-y-3">
              <p><strong>Order Number:</strong> {selectedOrder.orderNumber}</p>
              <p><strong>Customer:</strong> {selectedOrder.userName}</p>
              <p><strong>Email:</strong> {selectedOrder.userEmail}</p>
              <p><strong>Phone:</strong> {selectedOrder.userPhone}</p>
              <p><strong>Product:</strong> {selectedOrder.product.name}</p>
              <p><strong>Amount:</strong> {formatCurrency(selectedOrder.totalPrice)}</p>
              <p><strong>Address:</strong> {selectedOrder.shippingAddress.street}, {selectedOrder.shippingAddress.city}</p>
              {selectedOrder.trackingNumber && <p><strong>Tracking:</strong> {selectedOrder.trackingNumber}</p>}
            </div>
            <button
              onClick={() => setSelectedOrder(null)}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
