const mongoose = require('mongoose');


const settingSchema = mongoose.Schema({
  androidVersion: {
    type: String,
    required: true
  },
  iosVersion: {
    type: String,
    required: true
  },
  changelog: {
    type: String,
    maxlength: 256
  },
  required: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Types.ObjectId
  },
  createdAt: {
    type: Date
  }
})

module.exports = mongoose.model('settings', settingSchema);