const { validationResult } = require('express-validator');
const Book = require('../models/Book');
const Review = require('../models/Review');

exports.addBook = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const bookData = {
      ...req.body,
      addedBy: req.user._id
    };

    const book = new Book(bookData);
    await book.save();
    await book.populate('addedBy', 'username');

    res.status(201).json({
      message: 'Book added successfully',
      book
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'A book with this ISBN already exists' });
    }
    console.error(error);
    res.status(500).json({ error: 'Server error while adding book' });
  }
};

exports.getBooks = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.author) {
      filter.author = new RegExp(req.query.author, 'i');
    }
    if (req.query.genre) {
      filter.genre = new RegExp(req.query.genre, 'i');
    }

    const books = await Book.find(filter)
      .populate('addedBy', 'username')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const booksWithRatings = await Promise.all(
      books.map(async (book) => {
        const reviews = await Review.find({ book: book._id });
        const averageRating = reviews.length > 0 
          ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
          : 0;
        const bookObj = book.toObject();
        bookObj.averageRating = Math.round(averageRating * 10) / 10;
        bookObj.reviewCount = reviews.length;
        return bookObj;
      })
    );

    const total = await Book.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.json({
      books: booksWithRatings,
      pagination: {
        currentPage: page,
        totalPages,
        totalBooks: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while fetching books' });
  }
};

exports.getBookById = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const book = await Book.findById(req.params.id).populate('addedBy', 'username');
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const reviewPage = parseInt(req.query.reviewPage) || 1;
    const reviewLimit = parseInt(req.query.reviewLimit) || 5;
    const reviewSkip = (reviewPage - 1) * reviewLimit;

    const reviews = await Review.find({ book: book._id })
      .populate('user', 'username')
      .skip(reviewSkip)
      .limit(reviewLimit)
      .sort({ createdAt: -1 });

    const totalReviews = await Review.countDocuments({ book: book._id });
    const totalReviewPages = Math.ceil(totalReviews / reviewLimit);

    const allReviews = await Review.find({ book: book._id });
    const averageRating = allReviews.length > 0 
      ? allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length 
      : 0;

    const bookObj = book.toObject();
    bookObj.averageRating = Math.round(averageRating * 10) / 10;
    bookObj.reviewCount = allReviews.length;

    res.json({
      book: bookObj,
      reviews,
      reviewPagination: {
        currentPage: reviewPage,
        totalPages: totalReviewPages,
        totalReviews,
        hasNext: reviewPage < totalReviewPages,
        hasPrev: reviewPage > 1
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while fetching book details' });
  }
};

exports.addReview = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const existingReview = await Review.findOne({
      book: req.params.id,
      user: req.user._id
    });

    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this book' });
    }

    const review = new Review({
      book: req.params.id,
      user: req.user._id,
      rating: req.body.rating,
      comment: req.body.comment
    });

    await review.save();
    await review.populate('user', 'username');

    res.status(201).json({
      message: 'Review added successfully',
      review
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while adding review' });
  }
};