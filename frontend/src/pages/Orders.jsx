import { useState, useEffect } from 'react';
import { getMyOrders } from '../services/orderService.js';

const statusColors = {
  PLACED: 'bg-blue-50 text-blue-600',
  PACKED: 'bg-yellow-50 text-yellow-700',
  SHIPPED: 'bg-purple-50 text-purple-600',
  DELIVERED: 'bg-green-50 text-green-600',
  CANCELLED: 'bg-red-50 text-red-600',
};

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await getMyOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-73px)] flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-[calc(100vh-73px)] flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-2">No orders yet</p>
          <p className="text-gray-400 text-sm">Your order history will show up here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-73px)] bg-gray-50 px-8 py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Your Orders</h1>
        <p className="text-gray-500 mb-6">Track and review your past purchases</p>

        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-gray-400">Order #{order.id}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <span
                  className={`text-xs font-medium px-3 py-1 rounded-full ${
                    statusColors[order.status] || 'bg-gray-50 text-gray-600'
                  }`}
                >
                  {order.status}
                </span>
              </div>

              <div className="divide-y divide-gray-100 border-t border-gray-100 pt-3">
                {order.orderItems.map((item) => (
                  <div key={item.id} className="flex justify-between py-2 text-sm">
                    <span className="text-gray-600">Qty: {item.quantity}</span>
                    <span className="text-gray-800 font-medium">₹{item.totalPrice}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                <span className="text-sm text-gray-500">{order.shippingAddress}</span>
                <span className="text-lg font-bold text-indigo-600">₹{order.totalAmount}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Orders;