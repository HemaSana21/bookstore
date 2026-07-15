const Book = require('../models/Book');
const Review = require('../models/Review');

// @desc    Get all books with search, filter, sort, pagination
// @route   GET /api/books
exports.getBooks = async (req, res, next) => {
  try {
    const {
      search,
      category,
      language,
      minPrice,
      maxPrice,
      minRating,
      sort,
      page = 1,
      limit = 12,
      bestSeller,
      newArrival
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } }
      ];
    }
    if (category) query.category = category;
    if (language) query.language = language;
    if (minRating) query.rating = { $gte: Number(minRating) };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (bestSeller === 'true') query.isBestSeller = true;
    if (newArrival === 'true') query.isNewArrival = true;

    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    if (sort === 'price_desc') sortOption = { price: -1 };
    if (sort === 'rating') sortOption = { rating: -1 };
    if (sort === 'latest') sortOption = { createdAt: -1 };

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));
    const skip = (pageNum - 1) * limitNum;

    const [books, total] = await Promise.all([
      Book.find(query).populate('category', 'name slug').sort(sortOption).skip(skip).limit(limitNum),
      Book.countDocuments(query)
    ]);

    res.json({
      success: true,
      count: books.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      books
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single book + reviews + related books
// @route   GET /api/books/:id
exports.getBookById = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id).populate('category', 'name slug');
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    const reviews = await Review.find({ book: book._id }).populate('user', 'fullName profilePicture');
    const relatedBooks = await Book.find({
      category: book.category,
      _id: { $ne: book._id }
    }).limit(6);

    res.json({ success: true, book, reviews, relatedBooks });
  } catch (error) {
    next(error);
  }
};

// @desc    Create book (Admin)
// @route   POST /api/books
exports.createBook = async (req, res, next) => {
  try {
    const bookData = { ...req.body };
    if (req.file) {
      bookData.coverImage = `/uploads/${req.file.filename}`;
    }
    const book = await Book.create(bookData);
    res.status(201).json({ success: true, book });
  } catch (error) {
    next(error);
  }
};

// @desc    Update book (Admin)
// @route   PUT /api/books/:id
exports.updateBook = async (req, res, next) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
      updateData.coverImage = `/uploads/${req.file.filename}`;
    }
    const book = await Book.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }
    res.json({ success: true, book });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete book (Admin)
// @route   DELETE /api/books/:id
exports.deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }
    await Review.deleteMany({ book: book._id });
    res.json({ success: true, message: 'Book deleted successfully' });
  } catch (error) {
    next(error);
  }
};
