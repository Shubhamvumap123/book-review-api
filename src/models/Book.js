const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  author: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  genre: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  description: {
    type: String,
    maxlength: 1000
  },
  publishedYear: {
    type: Number,
    min: 1000,
    max: new Date().getFullYear()
  },
  isbn: {
    type: String,
    unique: true,
    sparse: true
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for average rating
bookSchema.virtual('averageRating').get(function() {
  return this._averageRating || 0;
});

// Virtual for review count
bookSchema.virtual('reviewCount').get(function() {
  return this._reviewCount || 0;
});

// Index for search functionality
bookSchema.index({ title: 'text', author: 'text' });
bookSchema.index({ author: 1, genre: 1 });

module.exports = mongoose.model('Book', bookSchema);
