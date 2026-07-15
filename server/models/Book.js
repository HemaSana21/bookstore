const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    price: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0, max: 100 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0 },
    language: { type: String, default: 'English' },
    publisher: { type: String, default: '' },
    stock: { type: Number, required: true, default: 0 },
    isbn: { type: String, required: true, unique: true },
    pages: { type: Number, default: 0 },
    coverImage: { type: String, default: '/uploads/default-book.png' },
    isBestSeller: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false }
  },
  { timestamps: true }
);

bookSchema.virtual('finalPrice').get(function () {
  return +(this.price - (this.price * this.discount) / 100).toFixed(2);
});

bookSchema.set('toJSON', { virtuals: true });
bookSchema.set('toObject', { virtuals: true });

// language_override avoids colliding with our own `language` field (e.g. "Telugu"),
// which is not a valid MongoDB text-search language value.
bookSchema.index(
  { title: 'text', author: 'text', description: 'text' },
  { language_override: 'textIndexLanguage' }
);

module.exports = mongoose.model('Book', bookSchema);
