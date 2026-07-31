import { Link, useNavigate } from 'react-router-dom';
import { isSeller, isAdmin } from '../utils/auth';

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const sellerView = isSeller();
  const adminView = isAdmin();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-ink border-b border-white/10">
      <Link to="/" className="font-display text-xl font-bold text-white tracking-tight">
        Smart<span className="text-coral">Cart</span>
      </Link>

      <div className="flex items-center gap-7 text-sm font-medium text-gray-300">
        {token ? (
          <>
            <Link to="/products" className="hover:text-white transition-colors">Products</Link>
            {sellerView ? (
              <Link to="/seller/orders" className="hover:text-white transition-colors">Seller Orders</Link>
            ) : (
              <>
                <Link to="/cart" className="hover:text-white transition-colors">Cart</Link>
                <Link to="/orders" className="hover:text-white transition-colors">Orders</Link>
                <Link to="/wishlist" className="hover:text-white transition-colors">Wishlist</Link>
                <Link to="/flash-sales" className="flex items-center gap-1.5 hover:text-white transition-colors">
                  <span className="w-1.5 h-1.5 bg-coral rounded-full animate-pulse"></span>
                  Flash Sales
                </Link>
              </>
            )}
            {adminView && (
              <Link to="/admin/categories" className="hover:text-white transition-colors">Manage Categories</Link>
            )}
            <Link
              to="/profile"
              className="w-8 h-8 rounded-full bg-cobalt/20 flex items-center justify-center hover:bg-cobalt/30 transition-colors"
              title="My Profile"
            >
              <span className="font-display text-sm font-bold text-cobalt">👤</span>
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-white transition-colors">Login</Link>
            <Link
              to="/register"
              className="px-4 py-1.5 rounded-md bg-cobalt text-white hover:bg-cobalt-dark transition-colors"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;