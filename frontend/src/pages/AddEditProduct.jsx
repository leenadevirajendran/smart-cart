import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createProduct, updateProduct, getProductById, getCategories } from '../services/productService';

function AddEditProduct() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [categoryId, setCategoryId] = useState('');

  useEffect(() => {
    getCategories().then(setCategories).catch((err) => console.error('Failed to load categories', err));

    if (isEditMode) {
      getProductById(id)
        .then((data) => {
          setName(data.name);
          setDescription(data.description || '');
          setPrice(data.price);
          setStockQuantity(data.stockQuantity);
        })
        .catch((err) => {
          console.error('Failed to load product', err);
          setError('Could not load this product.');
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      name,
      description,
      price: parseFloat(price),
      stockQuantity: parseInt(stockQuantity, 10),
      categoryId: categoryId ? parseInt(categoryId, 10) : null,
    };

    try {
      if (isEditMode) {
        await updateProduct(id, payload);
      } else {
        await createProduct(payload);
      }
      navigate('/seller/products');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save product. Make sure a category is selected.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-73px)] flex items-center justify-center bg-paper">
        <p className="text-gray-500">Loading product...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-73px)] bg-paper px-8 py-10">
      <div className="max-w-lg mx-auto">
        <h1 className="font-display text-3xl font-bold text-gray-800 mb-2">
          {isEditMode ? 'Edit Product' : 'Add New Product'}
        </h1>
        <p className="text-gray-500 mb-6">
          {isEditMode ? 'Update your product details' : 'List a new product in your store'}
        </p>

        {error && <div className="mb-4 px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cobalt"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cobalt"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cobalt"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                <input
                  type="number"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cobalt"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required={!isEditMode}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cobalt bg-white"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              {isEditMode && (
                <p className="text-xs text-gray-400 mt-1">Leave unselected to keep the current category</p>
              )}
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 rounded-lg bg-cobalt text-white font-medium hover:bg-cobalt-dark transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : isEditMode ? 'Save Changes' : 'Add Product'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddEditProduct;