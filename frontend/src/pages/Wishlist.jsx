import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getWishlist, removeFromWishlist } from '../services/wishlistService';
import { getProductColor, getProductInitial } from '../utils/productImage';

function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const data = await getWishlist();
      setItems(data);
    } catch (err) {
      console.error('Failed to fetch wishlist', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId) => {
    try {
      await removeFromWishlist(productId);
      fetchWishlist();
    } catch (err) {
      setMessage('Failed to remove item.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-73px)] flex items-center justify-center bg-paper">
        <p className="text-gray-500">Loading wishlist...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[calc(100vh-73px)] flex items-center justify-center bg-paper">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-2">Your wishlist is empty</p>
          <p className="text-gray-400 text-sm">Save products you love for later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-73px)] bg-paper px-8 py-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="font-display text-3xl font-bold text-gray-800 mb-2">Your Wishlist</h1>
        <p className="text-gray-500 mb-6">Products you've saved for later</p>

        {message && (
          <div className="mb-6 px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm inline-block">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col"
            >
              <Link to={item.product ? `/products/${item.product.id}` : '#'}>
                <div
                  className="aspect-square overflow-hidden flex items-center justify-center"
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
                    className="font-display text-6xl font-bold"
                    style={{
                      display: item.product?.imageUrl ? 'none' : 'flex',
                      color: item.product ? getProductColor(item.product) : '#9CA3AF',
                    }}
                  >
                    {item.product ? getProductInitial(item.product) : '?'}
                  </span>
                </div>
              </Link>

              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                  {item.product ? item.product.name : 'Unknown product'}
                </h3>
                <p className="text-sm text-gray-500 mb-4 flex-1">
                  {item.product ? item.product.description : ''}
                </p>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-price text-xl font-bold text-cobalt">
                    ₹{item.product ? item.product.price : '—'}
                  </span>
                </div>
                <button
                  onClick={() => handleRemove(item.product.id)}
                  className="w-full py-2 rounded-lg bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition-colors"
                >
                  Remove from Wishlist
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Wishlist;