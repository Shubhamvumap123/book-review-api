const express = require('express');
const { body, query } = require('express-validator');
const auth = require('../middleware/auth');
const booksController = require('../controllers/booksController');

const router = express.Router();

router.post('/', auth, [
  body('title')
    .trim()
    .notEmpty()
    .isLength({ max: 200 })
    .withMessage('Title is required and must be less than 200 characters'),
  body('author')
    .trim()
    .notEmpty()
    .isLength({ max: 100 })
    .withMessage('Author is required and must be less than 100 characters'),
  body('genre')
    .trim()
    .notEmpty()
    .isLength({ max: 50 })
    .withMessage('Genre is required and must be less than 50 characters'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('publishedYear')
    .optional()
    .isInt({ min: 1000, max: new Date().getFullYear() })
    .withMessage('Published year must be a valid year'),
  body('isbn')
    .optional()
    .trim()
], booksController.addBook);

router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('author').optional().trim(),
  query('genre').optional().trim()
], booksController.getBooks);

router.get('/:id', [
  query('reviewPage').optional().isInt({ min: 1 }).withMessage('Review page must be a positive integer'),
  query('reviewLimit').optional().isInt({ min: 1, max: 50 }).withMessage('Review limit must be between 1 and 50')
], booksController.getBookById);

router.post('/:id/reviews', auth, [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Comment must be less than 1000 characters')
], booksController.addReview);

module.exports = router;