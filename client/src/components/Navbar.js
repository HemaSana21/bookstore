import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import ConfirmDialog from './ConfirmDialog';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/books?search=${encodeURIComponent(search)}`);
    setMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    setMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="navbar-top">
        <Link to="/" className="brand">📚 BookStore</Link>

        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search by title, author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>

        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>☰</button>

        <nav className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/books" onClick={() => setMenuOpen(false)}>Books</Link>
          {user && <Link to="/wishlist" onClick={() => setMenuOpen(false)}>Wishlist</Link>}
          {user && (
            <Link to="/cart" onClick={() => setMenuOpen(false)}>
              Cart {cart.items?.length > 0 && <span className="badge">{cart.items.length}</span>}
            </Link>
          )}
          {user && <Link to="/orders" onClick={() => setMenuOpen(false)}>Orders</Link>}
          {user && <Link to="/profile" onClick={() => setMenuOpen(false)}>Profile</Link>}
          {user?.role === 'admin' && <Link to="/admin" onClick={() => setMenuOpen(false)}>Admin</Link>}

          {user ? (
            <button className="link-btn" onClick={() => setShowLogoutConfirm(true)}>Logout</button>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)}>Register</Link>
            </>
          )}
        </nav>
      </div>

      <ConfirmDialog
        open={showLogoutConfirm}
        title="Log out?"
        message="You'll need to sign in again to access your account, cart, and orders."
        confirmLabel="Log Out"
        cancelLabel="Stay Logged In"
        danger
        onConfirm={handleLogout}
        onClose={() => setShowLogoutConfirm(false)}
      />
    </header>
  );
};

export default Navbar;