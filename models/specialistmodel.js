const mongoose = require('mongoose');

const specialistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  }],
  imagepath: {
    type: String,
    required: true,
    unique: true,
  },
  whatsapp:{
    type:String,
    required:true
  },
  email: { 
  type: String, 
  required: true,
   unique: true
   },
  password: {
  type: String,
  required: true 
  },
  reviews:[
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review',
      required: true,
    }
  ],

  tokens: [{ type: String,required:true }]
});



//Export the model
module.exports = mongoose.model('Specialist', specialistSchema);