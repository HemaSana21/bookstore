import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';

const emptyForm = {
  title: '', author: '', description: '', category: '', price: '', discount: 0,
  language: 'English', publisher: '', stock: '', isbn: '', pages: '', isBestSeller: false, isNewArrival: false
};

const AdminBooks = () => {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [coverFile, setCoverFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [booksRes, catRes] = await Promise.all([
        api.get('/books', { params: { limit: 100 } }),
        api.get('/categories')
      ]);
      setBooks(booksRes.data.books);
      setCategories(catRes.data.categories);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setCoverFile(null);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      if (coverFile) formData.append('coverImage', coverFile);

      if (editingId) {
        await api.put(`/books/${editingId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Book updated');
      } else {
        await api.post('/books', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Book added');
      }
      resetForm();
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save book');
    }
  };

  const handleEdit = (book) => {
    setEditingId(book._id);
    setForm({
      title: book.title,
      author: book.author,
      description: book.description,
      category: book.category?._id || book.category,
      price: book.price,
      discount: book.discount,
      language: book.language,
      publisher: book.publisher,
      stock: book.stock,
      isbn: book.isbn,
      pages: book.pages,
      isBestSeller: book.isBestSeller,
      isNewArrival: book.isNewArrival
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this book?')) return;
    try {
      await api.delete(`/books/${id}`);
      toast.success('Book deleted');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete book');
    }
  };

  return (
    <div className="admin-page">
      <h2>Manage Books</h2>

      <form className="admin-form" onSubmit={handleSubmit} encType="multipart/form-data">
        <h3>{editingId ? 'Edit Book' : 'Add New Book'}</h3>
        <div className="input-row">
          <input placeholder="Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input placeholder="Author" required value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
        </div>
        <textarea placeholder="Description" required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <div className="input-row">
          <select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            <option value="">Select Category</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <input placeholder="Language" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} />
        </div>
        <div className="input-row">
          <input type="number" placeholder="Price" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          <input type="number" placeholder="Discount %" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} />
          <input type="number" placeholder="Stock" required value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
        </div>
        <div className="input-row">
          <input placeholder="Publisher" value={form.publisher} onChange={(e) => setForm({ ...form, publisher: e.target.value })} />
          <input placeholder="ISBN" required value={form.isbn} onChange={(e) => setForm({ ...form, isbn: e.target.value })} />
          <input type="number" placeholder="Pages" value={form.pages} onChange={(e) => setForm({ ...form, pages: e.target.value })} />
        </div>
        <div className="input-row checkboxes">
          <label><input type="checkbox" checked={form.isBestSeller} onChange={(e) => setForm({ ...form, isBestSeller: e.target.checked })} /> Best Seller</label>
          <label><input type="checkbox" checked={form.isNewArrival} onChange={(e) => setForm({ ...form, isNewArrival: e.target.checked })} /> New Arrival</label>
        </div>
        <label>Cover Image</label>
        <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files[0])} />

        <div className="form-actions">
          <button type="submit">{editingId ? 'Update Book' : 'Add Book'}</button>
          {editingId && <button type="button" className="link-btn" onClick={resetForm}>Cancel Edit</button>}
        </div>
      </form>

      <h3>All Books ({books.length})</h3>
      {loading ? <p className="page-loader">Loading...</p> : (
        <table className="admin-table">
          <thead>
            <tr><th>Title</th><th>Author</th><th>Price</th><th>Stock</th><th>Rating</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {books.map((b) => (
              <tr key={b._id}>
                <td>{b.title}</td>
                <td>{b.author}</td>
                <td>₹{b.price}</td>
                <td>{b.stock}</td>
                <td>{b.rating?.toFixed?.(1) || 0}</td>
                <td>
                  <button onClick={() => handleEdit(b)}>Edit</button>
                  <button className="link-btn" onClick={() => handleDelete(b._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminBooks;
