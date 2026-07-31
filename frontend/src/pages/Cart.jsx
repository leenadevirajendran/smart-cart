import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCart, removeFromCart, updateCartItemQuantity } from '../services/cartService';
import { placeOrder } from '../services/orderService.js';
import { getProductColor, getProductInitial } from '../utils/productImage';

function Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const data = await getCart();
      setCart(data);
    } catch (err) {
      console.error('Failed to fetch cart', err);
      setMessage('Failed to load cart.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (cartItemId) => {
    try {
      await removeFromCart(cartItemId);
      fetchCart();
    } catch (err) {
      setMessage('Failed to remove item.');
    }
  };

  const handleQuantityChange = async (cartItemId, newQty) => {
    if (newQty < 1) return;
    try {
      await updateCartItemQuantity(cartItemId, newQty);
      fetchCart();
    } catch (err) {
      setMessage('Failed to update quantity.');
    }
  };

  const handlePlaceOrder = async () => {
    if (!shippingAddress.trim()) {
      setMessage('Please enter a shipping address.');
      return;
    }
    try {
      await placeOrder(shippingAddress);
      navigate('/orders');
    } catch (err) {
      setMessage('Failed to place order. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-73px)] flex items-center justify-center bg-paper">
        <p className="text-gray-500">Loading cart...</p>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-[calc(100vh-73px)] flex items-center justify-center bg-paper">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-2">Your cart is empty</p>
          <p className="text-gray-400 text-sm">Browse products and add something you like!</p>
        </div>
      </div>
    );
  }

  const total = cart.items.reduce(
    (sum, item) => sum + (item.unitPrice * item.quantity || 0),
    0
  );

  return (
    <div className="min-h-[calc(100vh-73px)] bg-paper px-8 py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-display text-3xl font-bold text-gray-800 mb-2">Your Cart</h1>
        <p className="text-gray-500 mb-6">Review your items before checking out</p>

        {message && (
          <div className="mb-6 px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm">
            {message}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100 mb-6">
          {cart.items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-5">
              <div
                className="w-14 h-14 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center"
                style={{ backgroundColor: item.product ? `${getProductColor(item.product)}1A` : '#F3F4F6' }}
              >
                {item.product?.imageUrl ? (
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="w-full h-full object-contain"
                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                  />
                ) : null}
                <span
                  className="font-display font-bold text-lg"
                  style={{
                    display: item.product?.imageUrl ? 'none' : 'flex',
                    color: item.product ? getProductColor(item.product) : '#9CA3AF',
                  }}
                >
                  {item.product ? getProductInitial(item.product) : '?'}
                </span>
              </div>

              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">
                  {item.product ? item.product.name : 'Unknown product'}
                </h3>
                <p className="font-price text-sm text-gray-500 mt-1">
                  ₹{item.unitPrice} × {item.quantity}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                    className="px-3 py-1 text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    −
                  </button>
                  <span className="px-3 text-sm font-medium text-gray-700">{item.quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    className="px-3 py-1 text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => handleRemove(item.id)}
                  className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <span className="text-gray-600">Total</span>
            <span className="font-price text-2xl font-bold text-cobalt">₹{total.toFixed(2)}</span>
          </div>

          <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Address</label>
          <input
            type="text"
            value={shippingAddress}
            onChange={(e) => setShippingAddress(e.target.value)}
            placeholder="Enter your full shipping address"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-cobalt focus:border-transparent"
          />

          <button
            onClick={handlePlaceOrder}
            className="w-full py-3 rounded-lg bg-cobalt text-white font-medium hover:bg-cobalt-dark transition-colors"
          >
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
}

export default Cart;