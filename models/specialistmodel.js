const mongoose = require('mongoose');

const specialistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  imagepath: {
    type: String,
    required: true,
    unique: true,
  },
});



//Export the model
module.exports = mongoose.model('Specialist', specialistSchema);