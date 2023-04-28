const mongoose = require('mongoose');
const { Schema } = mongoose;




const userSchema = new Schema({
    userName: { type: String, required: true },  
    Phone: { type:String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    resetToken:{ type:String },
    resetTokenExpiration:{type:String},
    emailverified: { type: Boolean, default: false},
    tokens: [{ type: String,required:true }]
})




module.exports = mongoose.model('User', userSchema)