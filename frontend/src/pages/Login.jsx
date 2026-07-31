import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/authService';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await login(email.trim(), password.trim());
      localStorage.setItem('token', data.token);
      navigate('/products');
    } catch (err) {
      setError('Login failed. Please check your email and password.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-73px)] grid grid-cols-1 md:grid-cols-2">
      {/* Brand side */}
      <div className="hidden md:flex bg-ink flex-col justify-center px-16 relative overflow-hidden">
        <p className="font-mono text-coral text-sm mb-4 tracking-wide">WELCOME BACK</p>
        <h1 className="font-display text-4xl font-bold text-white max-w-sm leading-tight mb-4">
          Pick up right where you left off.
        </h1>
        <p className="text-gray-400 max-w-xs">
          Your cart, wishlist, and orders are all waiting for you.
        </p>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center bg-paper px-4 py-16">
        <div className="w-full max-w-sm">
          <h2 className="font-display text-2xl font-semibold text-gray-800 mb-1">Login</h2>
          <p className="text-gray-500 text-sm mb-6">Login to your SmartCart account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cobalt focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cobalt focus:border-transparent"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-cobalt text-white font-medium hover:bg-cobalt-dark transition-colors"
            >
              Login
            </button>
          </form>

          <p className="text-sm text-gray-500 mt-6 text-center">
            Don't have an account?{' '}
            <Link to="/register" className="text-cobalt font-medium hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;