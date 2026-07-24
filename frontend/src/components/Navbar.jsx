import { Link, useNavigate } from 'react-router-dom';
import { isSeller } from '../utils/auth';

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const sellerView = isSeller();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-200 shadow-sm">
      <Link to="/products" className="text-xl font-bold text-indigo-600 tracking-tight">
        SmartCart
      </Link>

      <div className="flex items-center gap-6 text-sm font-medium text-gray-600">
        {token ? (
          <>
            <Link to="/products" className="hover:text-indigo-600 transition-colors">Products</Link>
            {sellerView ? (
              <Link to="/seller/orders" className="hover:text-indigo-600 transition-colors">Seller Orders</Link>
            ) : (
              <>
                <Link to="/cart" className="hover:text-indigo-600 transition-colors">Cart</Link>
                <Link to="/orders" className="hover:text-indigo-600 transition-colors">Orders</Link>
                <Link to="/wishlist" className="hover:text-indigo-600 transition-colors">Wishlist</Link>
                <Link to="/flash-sales" className="hover:text-indigo-600 transition-colors">Flash Sales</Link>
              </>
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-indigo-600 transition-colors">Login</Link>
            <Link
              to="/register"
              className="px-4 py-1.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
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