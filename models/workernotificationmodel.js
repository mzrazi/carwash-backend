const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var workernotificationSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
       
    }, 
    message:{
        type:String,
        required:true,
       
    },
    user:{
        type:String,
        required:true
    }
},{

    timestamps:true
    
    
});

//Export the model
module.exports = mongoose.model('workerNotification', workernotificationSchema);