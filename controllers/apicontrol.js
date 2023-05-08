const  mongoose=require('mongoose')
const User=require('../models/usermodel')
const bcrypt=require("bcrypt")
var jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const Specialist = require('../models/specialistmodel');
var Category=require('../models/categorymodel');
const Contact=require('../models/contactmodel')
var Offer=require('../models/offersmodel');
const service = require('../models/servicemodel');
const Appointment = require('../models/appointmentmodel');
const message = require('../models/messagemodel');
const moment = require('moment');
const CancelledAppointment = require('../models/cancelledappointmentmodel');
const Review = require('../models/reviewmodel');
const admin = require('firebase-admin');
const CompletedAppointment = require('../models/completedappointment');
const notificationmodel = require('../models/notificationmodel');
const completedappointment = require('../models/completedappointment');
const review = require('../models/reviewmodel');






module.exports={


userSignup: async (req, res) => {
    try {
      const userdata = req.body;
      console.log(userdata);
    
      // Check if the email already exists and is verified
      const existingVerifiedUser = await User.findOne({ 
        email: userdata.email, 
        emailverified: true 
      });
      console.log(existingVerifiedUser);
      if (existingVerifiedUser) {
        return res.status(400).json({status:400, message: 'User already exists' });
      }
    
      // Check if the email already exists but is not verified
      let existingUser = await User.findOne({ 
        email: userdata.email, 
        emailverified: false 
      });
    
      if (existingUser) {
        // Generate a new token
        const token = jwt.sign({ email: userdata.email }, process.env.SECRET_KEY, {
          expiresIn: "1h"
        });
        const transporter = nodemailer.createTransport({
          host: 'smtp-relay.sendinblue.com',
          port: 587,
          secure: false,
          auth: {
            user: process.env.MAILER_Email,
            pass: process.env.MAILER_PASSWORD
          }
        });
        const mailOptions = {
          from: process.env.MAILER_Email,
          to: userdata.email,
          subject: 'Verify your email address',
          text: `Please click the following link to verify your email address:${process.env.APP_URL}/cwash/verify-email/${token}`
        };
    
        try {
          await transporter.sendMail(mailOptions);
          console.log( "mail"+process.env.MAILER_Email);
          console.log('Email sent successfully');
          // Your code to handle success goes here
        } catch (error) {
          console.log('Error sending email:', error);
          // Your code to handle error goes here
        }
        
        return res.status(201).json({ status:201,
          message: 'User already exists, a new verification email has been sent', 
          user: existingUser 
        });
      } else {
        // Hash the password
        const hash = await bcrypt.hash(userdata.password, 10);
        // Create a new user
        const user = new User({ 
          userName: userdata.userName,
          Phone: userdata.phone,
          email: userdata.email,
          password: hash,
          emailverified: false
        });
    
        // Save the user
        await user.save();

      
        const token = jwt.sign({ email: userdata.email }, process.env.SECRET_KEY, {
          expiresIn: "1h"
        });
        // Send an email with the token
        const transporter = nodemailer.createTransport({
          host: 'smtp-relay.sendinblue.com',
          port: 587,
          secure: false,
          auth: {
            user: process.env.MAILER_Email,
            pass: process.env.MAILER_PASSWORD
          }
        });
       
      
        const mailOptions = {
          from: process.env.MAILER_Email,
          to: userdata.email,
          subject: 'Verify your email address',
          text: `Please click the following link to verify your email address:${process.env.APP_URL}/cwash/verify-email/${token}`
        };
        
        try {
          await transporter.sendMail(mailOptions);
      
          console.log('Email sent successfully');
          // Your code to handle success goes here
        } catch (error) {
          console.log('Error sending email:', error);
          // Your code to handle error goes here
        }
        
        
        return res.status(201).json({ status:201,
          message: 'User created, verification email sent', 
          user 
        });
      }
     }catch (error) {
        console.log(error);
            return res.status(500).json({status:500, message: error.message });
       }
        },



        verifyEmail: (req, res) => {
          const token = req.params.token;
          jwt.verify(token, process.env.SECRET_KEY, async (err, decoded) => {
            if (err) {
              console.log(decoded.email);
              if (err.name === "TokenExpiredError") {
                User.findOneAndDelete({ email: decoded.email }, (err, user) => {
                  if (err) {
                    return res.status(500).json({ error: err, message: "Deletion error" });
                  }
                  if (!user) {
                    return res.status(401).json({ message: "User not found" });
                  }
                  return res.status(200).json({ status: 200, message: "User deleted due to expired token" });
                });
              } else {
                return res.status(401).json({ status: 401, message: "Invalid token" });
              }
            } else {
              const user = await User.findOne({ email: decoded.email });
              console.log(user);
              if (!user) {
                return res.status(401).json({ status: 401, message: "User not found" });
              }
              user.emailverified = true;
              await user.save();
         
              return res.status(200).json({ status: 200, message: "Email verified successfully" });
            }
          });
        },
        
        
        
        
        
        userlogin: async (req, res) => {
          const { email, password, token } = req.body;
          try {
            const user = await User.findOne({ email });
            if (!user) {
              return res.status(401).json({ status: 401, message: "User not found" });
            }
            if (!user.emailverified) {
              return res.status(401).json({ status: 401, message: "email not verified" });
            }
            const match = await bcrypt.compare(password, user.password);
            if (!match) {
              return res.status(401).json({ status: 401, message: "Incorrect password" });
            }
            user.tokens.push(token);
            await user.save();
            
            return res.status(200).json({ status: 200, message: "Login successful", user });
          } catch (error) {
            console.log(error);
            return res.status(500).json({ status: 500, message: "Server error" });
          }
        },
      
        homepagedata: async (req, res) => {
          try {
            const offers = await Offer.find({});
            offers.forEach((offer) => {
              offer.imagepath = `${process.env.APP_URL}/cwash${offer.imagepath}`;
            });
        
            const categories = await Category.find({});
            categories.forEach((category) => {
              category.imagepath = `${process.env.APP_URL}/cwash${category.imagepath}`;
            });
        
            const specialists = await Specialist.find({});
            specialists.forEach((specialist) => {
              specialist.imagepath = `${process.env.APP_URL}/cwash${specialist.imagepath}`;
            });
        
            const contact = await Contact.find({});
            res.status(200).json({
              status: 200,
              message: "success",
              offers,
              categories,
              specialists,
              contact,
            });
          } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error retrieving data" });
          }
        },
        

        servicespage: async (req, res) => {
          try {
            const categoryId = req.body.categoryId;
            const specialists = await Specialist.find({ categories: categoryId })
              .populate({
                path: "categories",
                populate: {
                  path: "services",
                },
              })
              .exec();
        
            specialists.forEach((specialist) => {
              specialist.categories.forEach((category) => {
                console.log(category.imagepath); // Before updating
                category.imagepath = `${process.env.APP_URL}/cwash${category.imagepath}`;
                console.log(category.imagepath); // After updating
              });
              specialist.imagepath = `${process.env.APP_URL}/cwash${specialist.imagepath}`;
              console.log(specialist.imagepath); // After updating
            });
        
            res.status(200).json({ status: 200, message: "success", specialists });
          } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error retrieving data" });
          }
        },
        

   addAppointment : async (req, res) => {
      try {
        const timestamp = req.body.date; // Unix timestamp in seconds
const date = new Date(timestamp * 1000); // convert to milliseconds
console.log(date); // output: Wed May 05 2021 15:45:01 GMT-0400 (Eastern Daylight Time)


        // create a new appointment object
        const newAppointment = new Appointment({
          date:date,
          timeslot: req.body.timeslot,
          services: req.body.serviceId, // assuming you have an array of serviceIds in the form data
          userId: req.body.userId,
          specialistId: req.body.specialistId,
          totalAmount: req.body.totalAmount,
          totalDuration: req.body.totalDuration,
        });
    
        // save the appointment to the database
        const savedAppointment = await newAppointment.save();
    
        // populate the service data for the saved appointment
        await savedAppointment.populate('services')
    
        res.status(200).json({ message: 'Appointment added successfully', appointment: savedAppointment });
      } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error adding appointment', error });
      }
    },
    savemessage:async(req,res)=>{

      var msg=req.body
  
      
  
      var newmessage=new message({
        title:msg.title,
        useremail:msg.email,
        message:msg.message,
      })
      try {
        
        newmessage.save().then((doc)=>{
          res.status(200).json({status:200,message:"succesfull",newmessage})
        }).catch((err)=>{
          res.status(404).json({status:404,message:err.message})
        })
      } catch (error) {
  
        res.status(500).json({status:500,message:"internal error",err:error})
      }
  
  
  
    },

    bookingpage: async (req, res) => {
      try {
        const { specialistId, date } = req.body;
        const timestamp = req.body.date; // Unix timestamp in seconds
        const dateObj = new Date(timestamp * 1000);
        const appointmentsByDate = [];
    
        // Create start and end of day
        const startOfDay = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
        const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
    
        // Find all appointments for the day
        const appointments = await Appointment.find({
          specialistId: specialistId,
          date: {
            $gte: startOfDay,
            $lt: endOfDay
          }
        }).exec();
    
        // Group appointments by timeslot
        const appointmentsByTimeSlot = {};
        appointments.forEach((appointment) => {
          if (!appointmentsByTimeSlot[appointment.timeslot]) {
            appointmentsByTimeSlot[appointment.timeslot] = [];
          }
          appointmentsByTimeSlot[appointment.timeslot].push(appointment);
        });
    
        // Create timeSlots array
        const timeSlots = ['9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm'];
    
        // Remove time slots that have appointments booked
        Object.entries(appointmentsByTimeSlot).forEach(([timeslot, appointments]) => {
          const index = timeSlots.indexOf(timeslot);
          if (index !== -1) {
            timeSlots.splice(index, 1);
          }
        });
    
        // // Remove past timeslots for the current day
        // const now = new Date();
        // const currentHour = now.getHours();
        // const today = new Date().setHours(0, 0, 0, 0);
        // if (timestamp * 1000 >= today) {
        //   const pastTimeSlots = timeSlots.slice(0, currentHour - 8);
        //   pastTimeSlots.forEach((timeslot) => {
        //     const index = timeSlots.indexOf(timeslot);
        //     if (index !== -1) {
        //       timeSlots.splice(index, 1);
        //     }
        //   });
        // }
    
        // Add appointments to the result array
        appointmentsByDate.push({ date: timestamp, timeSlots: timeSlots });
    
        return res.status(200).json({ message: 'success', appointmentsByDate });
      } catch (error) {
        res.status(500).json({ message: 'error', error: error.message });
      }
    }
    ,
    
    
    
    
    
    

 userCancelAppointment:async(req,res)=> {
      try {

        const {appointmentId,reason}=req.body
        const appointment = await Appointment.findById(appointmentId)
        if (!appointment) {
          res.status(404).json('Appointment not found');
        }
        const cancelledAppointment = new CancelledAppointment({
          date: appointment.date,
          timeslot: appointment.timeslot,
          services: appointment.services,
          userId: appointment.userId,
          specialistId: appointment.specialistId,
          totalAmount: appointment.totalAmount,
          totalDuration: appointment.totalDuration,
          reason:reason,
          cancelledby:'user'
        });
        const cancelled =await cancelledAppointment.save();
        if(!cancelled){
          return res.status(500).json({status:500 ,message:'cancellation error'})
        }
        const deleted=await Appointment.findByIdAndDelete(appointmentId);

        if(!deleted){
          cancelledAppointment.deleteOne()

          return res.status(500).json({status:500 ,message:'cancellation error'})

        }

        // const specialist=await Specialist.findById(appointment.specialistId)
        // const tokens=specialist.tokens
        // const response = await admin.messaging().sendMulticast({
        //   tokens,
        //   notification: {
        //     title:' cancelled ',
        //     body: 'appointment cancelled by user because of' +reason
        //   }
        // });
        // console.log('FCM response:', response);


        
        return res.status(200).json({message:'success',cancelledAppointment})
      } catch (err) {
        res.status(500).json({message:'error',err})
        
       
      }
    },
    
    specialistCancelAppointment:async(req,res)=> {
      try {

        const [appointmentId,reason]=req.body
        const appointment = await Appointment.findById(appointmentId)
        if (!appointment) {
          throw new Error('Appointment not found');
        }
        const cancelledAppointment = new CancelledAppointment({
          date: appointment.date,
          timeslot: appointment.timeslot,
          services: appointment.services,
          userId: appointment.userId,
          specialistId: appointment.specialistId,
          totalAmount: appointment.totalAmount,
          totalDuration: appointment.totalDuration,
          reason:reason,
          cancelledby:'specialist'
        });
        await cancelledAppointment.save();
        await Appointment.findByIdAndDelete(appointmentId);

        // const user=await User.findById(appointment.userId)
        // const tokens=user.tokens
        // const response = await admin.messaging().sendMulticast({
        //   tokens,
        //   notification: {
        //     title:' cancelled ',
        //     body: 'appointment cancelled by specialist because of' +reason
        //   }
        // });
        // console.log('FCM response:', response);


        
        return res.status(200).json({message:'success',cancelledAppointment})
      } catch (err) {
        res.status(500).json({message:'error',err})
        console.error(err);
        throw err;
      }
    },


    addreview:async(req,res)=>{
      const { appointmentId, review, reliability, tidiness, response, accuracy, pricing, rating, complete,recommendation} = req.body;
      try {
    
        const appointment=await  CompletedAppointment.findById(appointmentId)
        if(!appointment){
          return res.status(404).json({message:"not found"})
        }
        console.log(appointment);
    
        if(!appointment.userId || !appointment.specialistId) {
          return res.status(400).json({ message: "Missing userId or specialistId in appointment" });
        }
    
        const existingReview = await Review.findOne({ appointmentId });
        if(existingReview) {
          return res.status(400).json({ message: "A review has already been submitted for this appointment" });
        }
    
        const {userId,specialistId}=appointment
        const newReview = new Review({userId,specialistId, appointmentId, review, reliability, tidiness, response, accuracy, pricing, rating, complete,recommendation});
        const savedReview = await newReview.save();
        const specialist=await Specialist.findById(specialistId)
        const reviewId = savedReview._id
        specialist.reviews.push(reviewId)
        await specialist.save();
        await CompletedAppointment.findByIdAndUpdate(
          appointmentId,
          { reviewed: true },
          { new: true }
        );


        res.status(201).json({message:'done',savedReview});
      } catch (err) {
        res.status(400).json({ message: err.message });
      }
    
    },
    
  
    userdetails:async (req,res)=>{
      try {
        var id = req.body.userId
      
     const user= await User.findById(id).exec()
    
      user.imagepath = `https://${process.env.APP_URL}/cwash${user.imagepath}`;
    

     console.log(user);
     if (!user) {
      return res.status(404).json({status:404, message: "User not found" });
    }
    return res.status(200).json({status:200,message:"succesful", user });
    } catch (error) {
        return res.status(500).json({status:500, message: "Error retrieving user" });
        
      }
    },


    completedjob:async(req,res)=>{
      try {

        const {appointmentId}=req.body
        const appointment = await Appointment.findById(appointmentId)
        if (!appointment) {
        return res.status(404).json({message:'Appointment not found'});
        }
        const completedAppointment = new CompletedAppointment({
          date: appointment.date,
          timeslot: appointment.timeslot,
          services: appointment.services,
          userId: appointment.userId,
          specialistId: appointment.specialistId,
          totalAmount: appointment.totalAmount,
          totalDuration: appointment.totalDuration,
          paid:appointment.paid
        });
        await completedAppointment.save();
        await Appointment.findByIdAndDelete(appointmentId);

        const user=await User.findById(appointment.userId)
        // const tokens=user.tokens
        // const response = await admin.messaging().sendMulticast({
        //   tokens,
        //   notification: {
        //     title:' completed ',
        //     body: 'job completed'
        //   }
        // });
        // console.log('FCM response:', response);


        
        return res.status(200).json({message:'success'})
      } catch (err) {
        res.status(500).json({message:'error',err})
        console.error(err);
        throw err;
      }

    },

    getupcomingappointments:async(req,res)=>{
      try{

        const userId=req.body.userId
        const upcomingAppointments = await Appointment.find({
          userId: userId,
          status: 'booked'
        })
        .populate('userId')
        .populate('services')
        .populate('specialistId')
       
        
        
        if (upcomingAppointments.length === 0) {
          return res.status(404).json({ message: 'No upcoming appointments found' });
        }
        
        return res.status(200).json({ message: 'success', appointments:upcomingAppointments });
      } catch (error) {
        return res.status(500).json({ message: 'Error finding appointments', error: error.message });
      }}
      ,


    getAllNotifications:async(req,res)=>{
  
      const { userId } = req.body;
    
      try {
        const Notifications= await notificationmodel
          .find({ $or: [{ user: userId }, { user: 'all' }] })
          .sort({ createdAt: -1 })
          .exec();
    
        if (Notifications.length === 0) {
          return res.status(404).json({ success: false, message: 'notifications not found for user' });
        }
    
        return res.status(200).json({ success: true, data: Notifications});
      } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Error fetching notifications' });
      }
    },

    unreviewed:async(req,res)=>{

      try {

        const {userId}=req.body

        const appointments=await completedappointment.find({userId:userId,reviewed:false}).populate('specialistId services').exec()
        appointments.forEach(appointment=>{
          
          appointment.specialistId.imagepath=`${process.env.APP_URL}/cwash${appointment.specialistId.imagepath}`
         
        })

        if(!appointments){
          return res.status(404).json({message:'not found'})
        }

        return res.status(200).json({message:'success',appointments})
        
      } catch (error) {
        console.log(error);
        return res.status(500).json({message:'error',error})
        
        
      }

    },

    specialistreviews: async (req, res) => {
      const { id } = req.body;
      try {
        const reviews = await review.find({ specialisId: id }).sort({ createdAt: -1 }).populate('userId').exec();
    
        const reviewCount = reviews.length;
        let ratingSum = 0;
        reviews.forEach(review => {
          ratingSum += review.rating;
          // Modify the imagePath property of each user object in the reviews array
          if (review.userId) {
            review.userId.imagepath = `${process.env.APP_URL}/cwash${review.userId.imagepath}`;
          }
        });
        
        const averageRating = reviewCount > 0 ? ratingSum / reviewCount : 0;
        res.status(200).json({ message: 'success', reviews, averageRating });
      } catch (error) {
        res.status(500).json({ message: 'error', error });
      }
    },

    gethistoryappointments:async(req,res)=>{
      try {
        const { userId } = req.params;
    
        const cancelledAppointments = await CancelledAppointment.find({ user: userId }).populate('userId')
        .populate('services')
        .populate('specialistId');;
     
      
        const completedAppointments = await CompletedAppointment.find({ user: userId }).populate('userId')
        .populate('services')
        .populate('specialistId');
      
    
        const history = [...cancelledAppointments, ...completedAppointments];
    
        res.json({ history });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong.' });
      }
    },



     findAppointments:async (req, res) => {
      try {
        const specialistId = req.body.specialistId;
        const timestamp = req.body.date; // Unix timestamp in seconds
        const dateObj = new Date(timestamp * 1000);
        
    
        // Create start and end of day
        const startOfDay = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
        const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
    
        // Find all appointments for the day
        const appointments = await Appointment.find({
          specialistId: specialistId,
          date: {
            $gte: startOfDay,
            $lt: endOfDay
          }
        }).exec();
    
        // Find all other appointments for the specialist
        const upcomingAppointments = await Appointment.find({ specialist: specialistId, date: { $gte: new Date() } });
    
        // Find the completed appointments for the specialist
        const completedAppointments = await CompletedAppointment.find({ specialist: specialistId });
    
        // Send the response with the data
        res.status(200).json({
          message: 'Appointments found successfully',
          data: {
            appointment: appointments,
            upcomingAppointmentsCount: upcomingAppointments.length,
            completedAppointmentsCount: completedAppointments.length
          }
        });
      } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error finding appointments', error });
      }
    },



    dayappointmentWorker:async(req,res)=>{

      try {

        const specialistId = req.body.specialistId;
        const timestamp = req.body.date; // Unix timestamp in seconds
        const dateObj = new Date(timestamp * 1000);
        
        // Create start and end of day
        const startOfDay = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
        const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
        
        const limit = 10; // number of appointments per page
        const page = req.query.page || 1; // default to first page if not specified
        const skip = (page - 1) * limit;
        
        // Find all appointments for the day with pagination
        const appointments = await Appointment.find({
          specialistId: specialistId,
          date: {
            $gte: startOfDay,
            $lt: endOfDay
          }
        })
        .skip(skip)
        .limit(limit)
        .exec();
        
        const count = await Appointment.countDocuments({
          specialistId: specialistId,
          date: {
            $gte: startOfDay,
            $lt: endOfDay
          }
        }).exec();
        
        const totalPages = Math.ceil(count / limit);
        
        res.status(200).json({
          message: 'Appointments found successfully',
          appointments: appointments,
          upcomingCount: count,
          totalPages: totalPages
        });
        
        
      } catch (error) {
        res.status(500).json({message:'error', error})
        
      }
      
    }
    
    
    
    
    
    
    
        



}
