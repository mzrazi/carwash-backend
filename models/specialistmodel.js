const mongoose = require('mongoose');

const specialistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
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