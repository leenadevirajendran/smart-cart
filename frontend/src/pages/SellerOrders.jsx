import { useEffect, useState } from 'react';
import { getSellerOrders, updateOrderStatus } from '../services/orderService';

const STATUS_OPTIONS = ['PLACED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const STATUS_STYLES = {
  PLACED: 'bg-blue-100 text-blue-700',
  PACKED: 'bg-yellow-100 text-yellow-700',
  SHIPPED: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState('');

  const loadOrders = async () => {
    try {
      const data = await getSellerOrders();
      setOrders(data);
    } catch (err) {
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    setError('');
    try {
      const updated = await updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? updated : o))
      );
    } catch (err) {
      setError('Could not update status — this order may not contain your products.');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <div className="px-8 py-12 text-gray-500">Loading orders...</div>;

  return (
    <div className="max-w-3xl mx-auto px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900">Seller Orders</h1>
      <p className="text-gray-500 mt-1 mb-6">Manage orders containing your products</p>

      {error && (
        <div className="mb-4 px-4 py-2 rounded-md bg-red-50 text-red-600 text-sm">{error}</div>
      )}

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-gray-500 text-sm">Order #{order.id}</p>
                <p className="text-gray-400 text-xs">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[order.status]}`}>
                {order.status}
              </span>
            </div>

            <div className="divide-y divide-gray-100 border-t border-b border-gray-100 py-2 mb-3">
              {order.orderItems.map((item) => (
                <div key={item.id} className="flex justify-between py-2 text-sm text-gray-700">
                  <span>Qty: {item.quantity}</span>
                  <span>₹{item.totalPrice}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">{order.shippingAddress}</p>
              <p className="text-lg font-bold text-indigo-600">₹{order.totalAmount}</p>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <label className="text-sm text-gray-500">Update status:</label>
              <select
                value={order.status}
                disabled={updatingId === order.id}
                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1.5 text-sm"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              {updatingId === order.id && <span className="text-xs text-gray-400">Saving...</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SellerOrders;