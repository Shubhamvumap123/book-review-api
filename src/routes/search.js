const express = require('express');
const { query } = require('express-validator');
const searchController = require('../controllers/searchController');

const router = express.Router();

router.get('/', [
  query('q')
    .trim()
    .notEmpty()
    .withMessage('Search query is required'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50')
], searchController.searchBooks);

module.exports = router;