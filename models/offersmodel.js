const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var offerSchema = new mongoose.Schema({
    imagepath:{
        type:String,
        required:true,
        unique:true,
        index:true,
    }
});

//Export the model
module.exports = mongoose.model('Offer', offerSchema);