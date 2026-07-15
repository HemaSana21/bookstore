import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const { cart, fetchCart, updateQuantity, removeItem, applyCoupon } = useCart();
  const [couponInput, setCouponInput] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponInput.trim()) applyCoupon(couponInput.trim().toUpperCase());
  };

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="cart-page empty-cart">
        <h2>Your Cart is Empty</h2>
        <p>Looks like you haven't added anything yet.</p>
        <Link to="/books" className="btn-primary">Browse Books</Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h2>Shopping Cart</h2>
      <div className="cart-layout">
        <div className="cart-items">
          {cart.items.map(({ book, quantity, lineTotal }) => (
            <div key={book._id} className="cart-item">
              <img src={book.coverImage} alt={book.title} onError={(e) => { e.target.src = '/uploads/default-book.png'; }} />
              <div className="cart-item-info">
                <h4>{book.title}</h4>
                <p>{book.author}</p>
                <div className="quantity-controls">
                  <button onClick={() => updateQuantity(book._id, quantity - 1)}>-</button>
                  <span>{quantity}</span>
                  <button onClick={() => updateQuantity(book._id, quantity + 1)}>+</button>
                </div>
              </div>
              <div className="cart-item-price">
                <p>₹{lineTotal}</p>
                <button className="link-btn" onClick={() => removeItem(book._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h3>Price Summary</h3>
          <form className="coupon-form" onSubmit={handleApplyCoupon}>
            <input
              type="text"
              placeholder="Coupon code (e.g. BOOK10)"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
            />
            <button type="submit">Apply</button>
          </form>
          <div className="summary-row"><span>Subtotal</span><span>₹{cart.subtotal}</span></div>
          <div className="summary-row"><span>Discount</span><span>-₹{cart.discount}</span></div>
          <div className="summary-row"><span>GST (5%)</span><span>₹{cart.gst}</span></div>
          <div className="summary-row"><span>Delivery</span><span>{cart.deliveryCharge === 0 ? 'Free' : `₹${cart.deliveryCharge}`}</span></div>
          <div className="summary-row total"><span>Grand Total</span><span>₹{cart.grandTotal}</span></div>
          <button className="btn-primary full-width" onClick={() => navigate('/checkout')}>Proceed to Checkout</button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
