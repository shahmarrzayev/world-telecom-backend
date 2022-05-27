const mongoose = require('mongoose');


const importStatus = mongoose.Schema({
  path: {
    type: String
  },
  status: {
    type: String
  }
})

module.exports = mongoose.model('importstatuses', importStatus)