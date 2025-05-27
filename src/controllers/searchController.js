const { validationResult } = require('express-validator');
const Book = require('../models/Book');
const Review = require('../models/Review');

exports.searchBooks = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const searchQuery = req.query.q;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const searchFilter = {
      $or: [
        { title: { $regex: searchQuery, $options: 'i' } },
        { author: { $regex: searchQuery, $options: 'i' } }
      ]
    };

    const books = await Book.find(searchFilter)
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

    const total = await Book.countDocuments(searchFilter);
    const totalPages = Math.ceil(total / limit);

    res.json({
      query: searchQuery,
      books: booksWithRatings,
      pagination: {
        currentPage: page,
        totalPages,
        totalResults: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error during search' });
  }
};