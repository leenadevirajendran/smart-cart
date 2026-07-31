import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getAllProducts, filterProducts, getCategories } from '../services/productService';
import { addToCart } from '../services/cartService';
import { addToWishlist } from '../services/wishlistService';
import { getProductColor, getProductInitial } from '../utils/productImage';

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [searchParams] = useSearchParams();

  const [keyword, setKeyword] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchCategories();

    const urlKeyword = searchParams.get('keyword') || '';
    const urlCategoryId = searchParams.get('categoryId') || '';

    if (urlKeyword || urlCategoryId) {
      setKeyword(urlKeyword);
      setCategoryId(urlCategoryId);
      setLoading(true);
      filterProducts({ keyword: urlKeyword, categoryId: urlCategoryId, sortBy: 'newest' })
        .then(setProducts)
        .catch((err) => console.error('Failed to filter products', err))
        .finally(() => setLoading(false));
    } else {
      fetchProducts();
    }
  }, [searchParams]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getAllProducts();
      setProducts(data);
    } catch (err) {
      console.error('Failed to fetch products', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to fetch categories', err);
    }
  };

  const handleApplyFilters = async () => {
    try {
      setLoading(true);
      const data = await filterProducts({ keyword, categoryId, minPrice, maxPrice, sortBy });
      setProducts(data);
    } catch (err) {
      console.error('Failed to filter products', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = async () => {
    setKeyword('');
    setCategoryId('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');
    await fetchProducts();
  };

  const handleAddToCart = async (productId) => {
    try {
      await addToCart(productId, 1);
      setMessage('Added to cart!');
      setTimeout(() => setMessage(''), 2000);
    } catch (err) {
      setMessage('Failed to add to cart. Are you logged in as a Buyer?');
    }
  };

  const handleAddToWishlist = async (productId) => {
    try {
      await addToWishlist(productId);
      setMessage('Added to wishlist!');
      setTimeout(() => setMessage(''), 2000);
    } catch (err) {
      setMessage('Failed to add to wishlist.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-73px)] bg-gray-50 px-8 py-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">SmartCart Products</h1>
        <p className="text-gray-500 mb-6">Browse our full catalogue</p>

        {message && (
          <div className="mb-6 px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm inline-block">
            {message}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <input
              type="text"
              placeholder="Search products..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="col-span-1 lg:col-span-2 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cobalt"
            />

            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cobalt"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>

            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min ₹"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-1/2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cobalt"
              />
              <input
                type="number"
                placeholder="Max ₹"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-1/2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cobalt"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cobalt"
            >
              <option value="newest">What's New</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={handleApplyFilters}
              className="px-5 py-2 rounded-lg bg-cobalt text-white text-sm font-medium hover:bg-cobalt-dark transition-colors"
            >
              Apply Filters
            </button>
            <button
              onClick={handleClearFilters}
              className="px-5 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading products...</p>
        ) : products.length === 0 ? (
          <p className="text-gray-500">No products match your filters.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow"
              >
                <Link to={`/products/${product.id}`}>
                  <div className="aspect-square bg-gray-50 overflow-hidden flex items-center justify-center">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                      />
                    ) : null}
                    <div
                      className="w-full h-full items-center justify-center"
                      style={{ display: product.imageUrl ? 'none' : 'flex', backgroundColor: `${getProductColor(product)}1A` }}
                    >
                      <span className="font-display text-6xl font-bold" style={{ color: getProductColor(product) }}>
                        {getProductInitial(product)}
                      </span>
                    </div>
                  </div>
                </Link>

                <div className="p-5 flex flex-col flex-1">
                  <Link to={`/products/${product.id}`}>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1 hover:text-cobalt cursor-pointer">
                      {product.name}
                    </h3>
                  </Link>
                  {product.category?.name && (
                    <span className="text-xs text-gray-400 uppercase tracking-wide">{product.category.name}</span>
                  )}
                  <p className="text-sm text-gray-500 mb-4 flex-1">{product.description}</p>

                  <div className="flex items-center justify-between mb-4">
                    <span className="font-price text-xl font-bold text-cobalt">₹{product.price}</span>
                    <span className="text-xs text-gray-400">Stock: {product.stockQuantity}</span>
                  </div>

                  <button
                    onClick={() => handleAddToCart(product.id)}
                    className="w-full py-2 rounded-lg bg-cobalt text-white text-sm font-medium hover:bg-cobalt-dark transition-colors"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() => handleAddToWishlist(product.id)}
                    className="w-full mt-2 py-2 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    ♡ Add to Wishlist
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Products;
