import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import SellerOrders from './pages/SellerOrders';
import ProtectedRoute from './components/ProtectedRoute';
import Wishlist from './pages/Wishlist';
import FlashSales from './pages/FlashSales';
import ProductDetail from './pages/ProductDetail';
import Profile from './pages/Profile';
import AdminCategories from './pages/AdminCategories';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/products" element={<Products />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/orders" element={<Orders />} />
        <Route
          path="/seller/orders"
          element={
            <ProtectedRoute allowedRole="SELLER">
              <SellerOrders />
            </ProtectedRoute>
          }
        />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/flash-sales" element={<FlashSales />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/profile" element={<Profile />} />
        <Route
  path="/admin/categories"
  element={
    <ProtectedRoute allowedRole="ADMIN">
      <AdminCategories />
    </ProtectedRoute>
  }
/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;