import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getAllProducts, filterProducts, getCategories } from '../services/productService';
import { addToCart } from '../services/cartService';
import { addToWishlist } from '../services/wishlistService';
import { getProductColor, getProductInitial } from '../utils/productImage';
import { isSeller, isAdmin } from '../utils/auth';
import { useToast } from '../context/ToastContext';

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  const hideBuyerActions = isSeller() || isAdmin();

  const [keyword, setKeyword] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showPricePanel, setShowPricePanel] = useState(false);

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
      setShowPricePanel(false);
    }
  };

  const handleClearFilters = async () => {
    setKeyword('');
    setCategoryId('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');
    setShowPricePanel(false);
    await fetchProducts();
  };

  const handleAddToCart = async (productId) => {
    try {
      await addToCart(productId, 1);
      showToast('Added to cart!');
    } catch (err) {
      showToast('Failed to add to cart. Are you logged in as a Buyer?', 'error');
    }
  };

  const handleAddToWishlist = async (productId) => {
    try {
      await addToWishlist(productId);
      showToast('Added to wishlist!');
    } catch (err) {
      showToast('Failed to add to wishlist.', 'error');
    }
  };

  const hasActiveFilters = keyword || categoryId || minPrice || maxPrice || sortBy !== 'newest';

  return (
    <div className="min-h-[calc(100vh-73px)] bg-gray-50 px-8 py-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="font-display text-3xl font-bold text-gray-800 mb-2">SmartCart Products</h1>
        <p className="text-gray-500 mb-6">Browse our full catalogue</p>

        {/* Amazon-style search bar */}
        <form
          onSubmit={(e) => { e.preventDefault(); handleApplyFilters(); }}
          className="flex mb-4 shadow-sm rounded-lg overflow-hidden border border-gray-200 bg-white"
        >
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="px-3 py-3 bg-gray-50 border-r border-gray-200 text-sm text-gray-600 focus:outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Search SmartCart..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="flex-1 px-4 py-3 text-sm focus:outline-none"
          />
          <button
            type="submit"
            className="px-6 bg-cobalt text-white hover:bg-cobalt-dark transition-colors flex items-center justify-center text-lg"
          >
            🔍
          </button>
        </form>

        {/* Sort + filter row */}
        <div className="flex items-center gap-3 flex-wrap mb-8">
          <span className="text-sm text-gray-400">
            {loading ? '...' : `${products.length} result${products.length === 1 ? '' : 's'}`}
          </span>

          <div className="relative ml-auto">
            <button
              onClick={() => setShowPricePanel(!showPricePanel)}
              className="px-4 py-2 rounded-full border border-gray-200 bg-white text-sm text-gray-700 hover:border-cobalt hover:text-cobalt transition-colors"
            >
              Price {(minPrice || maxPrice) && '•'} ⌄
            </button>
            {showPricePanel && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 p-4 z-20">
                <div className="flex gap-2 mb-3">
                  <input
                    type="number"
                    placeholder="Min ₹"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-1/2 px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-cobalt"
                  />
                  <input
                    type="number"
                    placeholder="Max ₹"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-1/2 px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-cobalt"
                  />
                </div>
                <button
                  onClick={handleApplyFilters}
                  className="w-full py-1.5 rounded bg-cobalt text-white text-sm font-medium hover:bg-cobalt-dark transition-colors"
                >
                  Apply
                </button>
              </div>
            )}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 rounded-full border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none"
          >
            <option value="newest">What's New</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>

          <button
            onClick={handleApplyFilters}
            className="px-4 py-2 rounded-full bg-cobalt text-white text-sm font-medium hover:bg-cobalt-dark transition-colors"
          >
            Apply
          </button>

          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="text-sm text-gray-400 hover:text-red-500 transition-colors"
            >
              Clear all
            </button>
          )}
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
                  <p className="text-sm text-gray-500 mb-4 flex-1">{product.description}</p>

                  <div className="flex items-center justify-between mb-4">
                    <span className="font-price text-xl font-bold text-cobalt">₹{product.price}</span>
                    <span className="text-xs text-gray-400">Stock: {product.stockQuantity}</span>
                  </div>

                  {!hideBuyerActions && (
                    <>
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
                    </>
                  )}
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