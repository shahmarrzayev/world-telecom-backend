const mongoose = require('mongoose');


const seoPageSchema = mongoose.Schema({
  title: {
    type: String,
    minlength: 4,
    maxlength: 256,
    required: true

  },
  description: {
    type: String,
    maxlength: 64000,
  },
  tag: {
    type: String,
    unique: true,
    minlength: 4,
    maxlength: 256,
    required: true,
  },
  meta_title: {
    type: String,
    maxlength: 300
  },
  meta_description: {
    type: String,
    maxlength: 300
  }
});

module.exports = mongoose.model('seopages', seoPageSchema);