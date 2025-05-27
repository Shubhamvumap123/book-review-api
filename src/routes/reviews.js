// routes/reviews.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const Review = require('../models/Review');
const auth = require('../middleware/auth');

const router = express.Router();

router.put('/:id', auth, [
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Comment must be less than 1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Check if the review belongs to the authenticated user
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied. You can only update your own reviews.' });
    }

    // Update review
    if (req.body.rating !== undefined) review.rating = req.body.rating;
    if (req.body.comment !== undefined) review.comment = req.body.comment;

    await review.save();
    await review.populate('user', 'username');
    await review.populate('book', 'title');

    res.json({
      message: 'Review updated successfully',
      review
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while updating review' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Check if the review belongs to the authenticated user
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied. You can only delete your own reviews.' });
    }

    await Review.findByIdAndDelete(req.params.id);

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while deleting review' });
  }
});

module.exports = router;
