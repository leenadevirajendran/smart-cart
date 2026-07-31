import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { filterProducts, getCategories, getTrendingProducts, getPersonalizedProducts } from '../services/productService';
import { getProductColor, getProductInitial } from '../utils/productImage';

function Home() {
  const [trending, setTrending] = useState([]);
  const [categories, setCategories] = useState([]);
  const [personalized, setPersonalized] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadHome();
  }, []);

  const loadHome = async () => {
    try {
      const token = localStorage.getItem('token');
      const promises = [getTrendingProducts(8), getCategories()];
      if (token) {
        promises.push(getPersonalizedProducts(8));
      }

      const results = await Promise.all(promises);
      setTrending(results[0]);
      setCategories(results[1]);
      if (token) {
        setPersonalized(results[2]);
      }
    } catch (err) {
      console.error('Failed to load homepage data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/products?keyword=${encodeURIComponent(searchInput)}`);
  };

  return (
    <div className="bg-paper">
      <section className="bg-ink relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-8 py-20 relative z-10">
          <p className="font-mono text-coral text-sm mb-4 tracking-wide">NEW ARRIVALS EVERY WEEK</p>
          <h1 className="font-display text-5xl font-bold text-white max-w-xl leading-tight mb-6">
            Tech that keeps up with you.
          </h1>
          <p className="text-gray-400 max-w-md mb-8">
            Phones, gadgets, and everyday essentials — at prices that update live, the moment a deal drops.
          </p>

          <form onSubmit={handleSearch} className="flex max-w-lg">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search for iPhone, headphones, laptops..."
              className="flex-1 px-4 py-3 rounded-l-lg border-0 focus:outline-none focus:ring-2 focus:ring-cobalt text-sm"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-r-lg bg-cobalt text-white text-sm font-medium hover:bg-cobalt-dark transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-ink-light">
          <div className="max-w-6xl mx-auto px-8 py-3 flex items-center gap-8 font-price text-xs text-gray-400 overflow-x-auto">
            <span className="flex items-center gap-2 shrink-0">
              <span className="w-1.5 h-1.5 bg-signal rounded-full"></span> LIVE STOCK TRACKING
            </span>
            <span className="shrink-0">FLASH SALES UPDATE IN REAL TIME</span>
            <span className="shrink-0">FREE SHIPPING ON ORDERS OVER ₹999</span>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-8 py-14">
        {categories.length > 0 && (
          <div className="mb-14">
            <h2 className="font-display text-xl font-semibold text-gray-800 mb-5">Shop by category</h2>
            <div className="flex flex-wrap gap-3">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/products?categoryId=${cat.id}`}
                  className="px-5 py-2.5 rounded-full bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:border-cobalt hover:text-cobalt transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-xl font-semibold text-gray-800">Trending Now</h2>
            <Link to="/products" className="text-sm font-medium text-cobalt hover:underline">
              View all →
            </Link>
          </div>

          {loading ? (
            <p className="text-gray-500 text-sm">Loading products...</p>
          ) : trending.length === 0 ? (
            <p className="text-gray-500 text-sm">No products yet — check back soon.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {trending.map((product) => (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group"
                >
                  <div className="aspect-square bg-gray-50 overflow-hidden flex items-center justify-center">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
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
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-gray-800 mb-1 truncate">{product.name}</h3>
                    <p className="font-price text-base font-semibold text-cobalt">₹{product.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {personalized.length > 0 && (
          <div className="mt-14">
            <h2 className="font-display text-xl font-semibold text-gray-800 mb-5">Picked for you</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {personalized.map((product) => (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group"
                >
                  <div className="aspect-square bg-gray-50 overflow-hidden flex items-center justify-center">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
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
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-gray-800 mb-1 truncate">{product.name}</h3>
                    <p className="font-price text-base font-semibold text-cobalt">₹{product.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;