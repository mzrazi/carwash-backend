const mongoose = require('mongoose');

const completedAppointmentSchema = new mongoose.Schema({
  date: {
    type:Date,
    required: true,
  },
  timeslot: {
    type: String,
    required: true,
  },
  services: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true,
  }],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  specialistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Specialist',
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  totalDuration: {
    type: Number,
    required: true,
  },
  paid:{
    type:Boolean,
    default:false
  },
  status:{
    type:String,
    enum:['N/a','completed'],
    default:'completed'
  },
  reviewed:{
    type:Boolean,
  default:false,
  required:true
  }
})

module.exports = mongoose.model('CompletedAppointment', completedAppointmentSchema);