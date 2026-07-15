require('dotenv').config();
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('./db');
const { saveCoverForBook } = require('../utils/generateCover');

const User = require('../models/User');
const Category = require('../models/Category');
const Book = require('../models/Book');
const Review = require('../models/Review');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

const CATEGORY_NAMES = [
  'Fiction',
  'Non Fiction',
  'Science',
  'Technology',
  'Programming',
  'History',
  'Biography',
  'Business',
  'Self Help',
  'Children',
  'Comics'
];

const AUTHORS = [
  'Robert C. Martin', 'Yuval Noah Harari', 'James Clear', 'Michelle Obama', 'Malcolm Gladwell',
  'Stephen King', 'Agatha Christie', 'J.K. Rowling', 'George R.R. Martin', 'Chimamanda Ngozi Adichie',
  'Walter Isaacson', 'Brene Brown', 'Yoko Ogawa', 'Haruki Murakami', 'Delia Owens',
  'Tara Westover', 'Andy Weir', 'Cal Newport', 'Ryan Holiday', 'Bill Bryson'
];

const TITLE_WORDS_A = ['The Silent', 'A Brief History of', 'Atomic', 'The Midnight', 'Deep Work:',
  'The Psychology of', 'Sapiens:', 'Educated:', 'Becoming', 'The Alchemist:', 'Clean', 'Project',
  'The Girl on', 'Where the Crawdads', 'The Da Vinci', 'The Great', 'Thinking, Fast and',
  'The Power of', 'Man\'s Search for', 'The Subtle Art of'];
const TITLE_WORDS_B = ['Ocean', 'Habits', 'Library', 'Time', 'Money', 'Everything', 'Tomorrow',
  'Humankind', 'A Memoir', 'Code', 'Hail Mary', 'the Train', 'Sing', 'Code', 'Gatsby', 'Slow',
  'Now', 'Meaning', 'Not Giving a F*ck'];

const LANGUAGES = ['English', 'Hindi', 'Telugu', 'Tamil', 'Spanish'];

const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const seed = async () => {
  try {
    await connectDB();

    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Book.deleteMany({}),
      Review.deleteMany({})
    ]);

    console.log('Creating categories...');
    const categories = await Category.insertMany(
      CATEGORY_NAMES.map((name) => ({
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        description: `Explore our collection of ${name} books.`
      }))
    );

    console.log('Creating admin user...');
    const admin = await User.create({
      fullName: 'BookStore Admin',
      email: process.env.ADMIN_EMAIL || 'admin@bookstore.com',
      mobile: '9999999999',
      password: process.env.ADMIN_PASSWORD || 'Admin@12345',
      role: 'admin'
    });

    console.log('Creating 20 customer users...');
    const users = [];
    for (let i = 1; i <= 20; i++) {
      const user = await User.create({
        fullName: `Test User ${i}`,
        email: `user${i}@example.com`,
        mobile: `90000000${String(i).padStart(2, '0')}`,
        password: 'Password@123',
        role: 'customer'
      });
      users.push(user);
    }

    console.log('Creating 50 books with generated cover art...');
    const books = [];
    for (let i = 1; i <= 50; i++) {
      const category = randomFrom(categories);
      const price = randomInt(150, 999);
      const title = `${randomFrom(TITLE_WORDS_A)} ${randomFrom(TITLE_WORDS_B)} ${i}`;
      const author = randomFrom(AUTHORS);

      const coverImage = saveCoverForBook(
        { filename: `book-${i}`, title, author, category: category.name },
        UPLOADS_DIR
      );

      const book = await Book.create({
        title,
        author,
        description:
          'A captivating read that takes you on a journey through compelling storytelling, ' +
          'rich characters, and thought-provoking ideas. A must-have addition to any book lover\'s shelf.',
        category: category._id,
        price,
        discount: randomFrom([0, 5, 10, 15, 20, 25]),
        rating: 0,
        language: randomFrom(LANGUAGES),
        publisher: randomFrom(['Penguin', 'HarperCollins', 'Simon & Schuster', 'Macmillan', 'Scholastic']),
        stock: randomInt(0, 100),
        isbn: `978-${randomInt(1000000000, 9999999999)}`,
        pages: randomInt(120, 650),
        coverImage,
        isBestSeller: Math.random() < 0.2,
        isNewArrival: Math.random() < 0.2
      });
      books.push(book);
    }

    console.log('Creating 30 reviews...');
    const comments = [
      'Absolutely loved this book, couldn\'t put it down!',
      'A decent read but the pacing was a bit slow in the middle.',
      'One of the best books I have read this year.',
      'Great insights, highly recommend to everyone.',
      'The story was okay, expected a bit more from the ending.',
      'Beautifully written and deeply moving.',
      'Good value for the price, arrived in great condition.',
      'A must-read for anyone interested in the subject.'
    ];

    const usedPairs = new Set();
    let reviewCount = 0;
    while (reviewCount < 30) {
      const user = randomFrom(users);
      const book = randomFrom(books);
      const key = `${user._id}-${book._id}`;
      if (usedPairs.has(key)) continue;
      usedPairs.add(key);

      await Review.create({
        book: book._id,
        user: user._id,
        rating: randomInt(2, 5),
        comment: randomFrom(comments)
      });
      reviewCount++;
    }

    // Recalculate ratings for all books based on seeded reviews
    for (const book of books) {
      const reviews = await Review.find({ book: book._id });
      const numReviews = reviews.length;
      const rating = numReviews > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / numReviews : 0;
      await Book.findByIdAndUpdate(book._id, { rating: +rating.toFixed(1), numReviews });
    }

    console.log('\n✅ Seed complete!');
    console.log(`Categories: ${categories.length}`);
    console.log(`Users: ${users.length} + 1 admin`);
    console.log(`Books: ${books.length}`);
    console.log(`Reviews: ${reviewCount}`);
    console.log(`\nAdmin login -> email: ${admin.email} | password: ${process.env.ADMIN_PASSWORD || 'Admin@12345'}`);
    console.log('Sample customer login -> email: user1@example.com | password: Password@123');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seed();
