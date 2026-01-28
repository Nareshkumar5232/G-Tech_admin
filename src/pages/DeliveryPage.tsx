import { getOrders } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';
import { Package, Truck, CheckCircle } from 'lucide-react';

export function DeliveryPage() {
  const orders = getOrders().filter(o => ['confirmed', 'shipped', 'delivered'].includes(o.status));

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Delivery Tracking</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">Track and manage deliveries</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              {order.status === 'delivered' ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
              ) : order.status === 'shipped' ? (
                <Truck className="w-8 h-8 text-blue-600" />
              ) : (
                <Package className="w-8 h-8 text-yellow-600" />
              )}
              <div>
                <p className="font-bold text-gray-900">{order.orderNumber}</p>
                <p className="text-sm text-gray-600">{order.userName}</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <p><strong>Product:</strong> {order.product.name}</p>
              <p><strong>Amount:</strong> {formatCurrency(order.totalPrice)}</p>
              <p><strong>Location:</strong> {order.shippingAddress.city}</p>
              {order.trackingNumber && <p><strong>Tracking:</strong> {order.trackingNumber}</p>}
            </div>

            <div className="mt-4">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {order.status.toUpperCase()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
