import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyProducts, deleteProduct } from '../services/productService';
import { getProductColor, getProductInitial } from '../utils/productImage';

function MyProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await getMyProducts();
      setProducts(data);
    } catch (err) {
      console.error('Failed to load your products', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this product? It will no longer be visible to buyers.')) return;
    try {
      await deleteProduct(id);
      fetchProducts();
    } catch (err) {
      setError('Failed to delete product.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-73px)] flex items-center justify-center bg-paper">
        <p className="text-gray-500">Loading your products...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-73px)] bg-paper px-8 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-800 mb-2">My Products</h1>
            <p className="text-gray-500">Manage your product listings</p>
          </div>
          <Link
            to="/seller/products/new"
            className="px-5 py-2.5 rounded-lg bg-cobalt text-white text-sm font-medium hover:bg-cobalt-dark transition-colors"
          >
            + Add Product
          </Link>
        </div>

        {error && <div className="mb-4 px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

        {products.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
            <p className="text-gray-500">You haven't listed any products yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col"
              >
                <div
                  className="aspect-square overflow-hidden flex items-center justify-center"
                  style={{ backgroundColor: `${getProductColor(product)}1A` }}
                >
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-contain"
                      onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                    />
                  ) : null}
                  <span
                    className="font-display text-6xl font-bold"
                    style={{ display: product.imageUrl ? 'none' : 'flex', color: getProductColor(product) }}
                  >
                    {getProductInitial(product)}
                  </span>
                </div>

                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-semibold text-gray-800 mb-1">{product.name}</h3>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-price text-lg font-bold text-cobalt">₹{product.price}</span>
                    <span className="text-xs text-gray-400">Stock: {product.stockQuantity}</span>
                  </div>
                  {!product.active && (
                    <span className="text-xs font-medium text-red-500 mb-3">Inactive</span>
                  )}
                  <div className="flex gap-2 mt-auto">
                    <Link
                      to={`/seller/products/${product.id}/edit`}
                      className="flex-1 text-center py-2 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="flex-1 py-2 rounded-lg bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyProducts;