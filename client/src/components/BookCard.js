import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';

const BookCard = ({ book }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const finalPrice = +(book.price - (book.price * book.discount) / 100).toFixed(2);

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    addToCart(book._id, 1);
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    try {
      await api.post('/wishlist/add', { bookId: book._id });
      toast.success('Added to wishlist');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to wishlist');
    }
  };

  return (
    <Link to={`/books/${book._id}`} className="book-card">
      <div className="book-cover">
        <img src={book.coverImage} alt={book.title} onError={(e) => { e.target.src = '/uploads/default-book.png'; }} />
        {book.discount > 0 && <span className="discount-tag">-{book.discount}%</span>}
      </div>
      <div className="book-info">
        <h3 className="book-title">{book.title}</h3>
        <p className="book-author">{book.author}</p>
        <div className="book-rating">⭐ {book.rating?.toFixed?.(1) || 0} ({book.numReviews || 0})</div>
        <div className="book-price">
          <span className="final-price">₹{finalPrice}</span>
          {book.discount > 0 && <span className="original-price">₹{book.price}</span>}
        </div>
        <div className="book-actions">
          <button onClick={handleAddToCart} disabled={book.stock === 0}>
            {book.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
          <button className="icon-btn" onClick={handleWishlist} title="Add to wishlist">♥</button>
        </div>
      </div>
    </Link>
  );
};

export default BookCard;
