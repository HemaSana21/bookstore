import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import BookCard from '../components/BookCard';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState({ books: [] });
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      const res = await api.get('/wishlist');
      setWishlist(res.data.wishlist);
    } catch (err) {
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (bookId) => {
    try {
      const res = await api.delete(`/wishlist/remove/${bookId}`);
      setWishlist(res.data.wishlist);
      toast.info('Removed from wishlist');
    } catch (err) {
      toast.error('Failed to remove item');
    }
  };

  if (loading) return <p className="page-loader">Loading wishlist...</p>;

  return (
    <div className="wishlist-page">
      <h2>My Wishlist</h2>
      {wishlist.books.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-blob blob-1"></div>
          <div className="empty-state-blob blob-2"></div>
          <div className="empty-state-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 20.5s-7.5-4.6-10-9.3C.4 8 1.8 4.5 5 3.5c2-.6 4 .1 5.3 1.8L12 7.2l1.7-1.9c1.3-1.7 3.3-2.4 5.3-1.8 3.2 1 4.6 4.5 3 7.7-2.5 4.7-10 9.3-10 9.3z"
                stroke="#FFFFFF"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h3>Your wishlist is feeling a little empty</h3>
          <p>Save the books that catch your eye and come back to them anytime — start building your list now.</p>
          <Link to="/books" className="btn-primary">Discover Books</Link>
        </div>
      ) : (
        <div className="book-grid">
          {wishlist.books.map((book) => (
            <div key={book._id} className="wishlist-item">
              <BookCard book={book} />
              <button className="remove-btn" onClick={() => handleRemove(book._id)}>Remove</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;