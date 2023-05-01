const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var reviewSchema = new mongoose.Schema({
    appointmentId:{
        type:String,
        required:true,
        unique:true,
    },
    userId:{
        type:String,
        required:true,
       
    },
    specialistId:{
        type:String,
        required:true,
    },
   recommendation:{
        type:String,
        enum:['yes','no']
    }, complete:{
        type:String,
        enum:['yes','no']
        
    }, review:{
        type:String,
        
    },
    
    reliability:{
        type:String,
        enum: ['very good', 'good','average','bad','verybad', 'N/a'],
        default:'N/a'
    },tidiness:{
        type:String,
        enum: ['very good', 'good','average','bad','verybad', 'N/a'],
        default:'N/a'
       
    },response:{
        type:String,
        enum: ['very good', 'good','average','bad','verybad', 'N/a'],
        default:'N/a'
       
    },accuracy:{
        type:String,
        enum: ['very good', 'good','average','bad','verybad', 'N/a'],
        default:'N/a'
       
    },pricing:{
        type:String,
        enum: ['very good', 'good','average','bad','verybad', 'N/a'],
        default:'N/a'
        
    },rating:{
        type:String,
        enum: ['1', '2','3','4','5'],

        
    },
});

//Export the model
module.exports = mongoose.model('Review', reviewSchema);