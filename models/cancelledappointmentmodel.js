const mongoose = require('mongoose');

const cancelledAppointmentSchema = new mongoose.Schema({
  date: {
    type: Date,
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
cancelledby:{
    type:String,
    enum:['user','specialist']

},
reason:{
    type:String,
},
 
status:{
  type:String,
  enum:['N/a','cancelled'],
  default:'cancelled'
},
});

module.exports = mongoose.model('CancelledAppointment', cancelledAppointmentSchema);