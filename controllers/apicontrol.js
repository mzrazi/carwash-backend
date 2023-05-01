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
      
    homepagedata:async(req,res)=>{
     
        try {
          const offers = await Offer.find({});
          const categories = await Category.find({});
          const specialists = await Specialist.find({});
          const contact = await Contact.find({});
          res.status(200).json({status:200,message:'success' , offers, categories, specialists, contact })
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: 'Error retrieving data' });
        }
     
    },

    servicespage:async(req,res)=>{

      try {

        const categoryId=req.body.categoryId
        const specialists = await Specialist.find({ categories: categoryId })
        .populate({ 
          path: 'categories', 
          populate: { 
            path: 'services', 
          }, 
          "priority": {
            "$eq": [
              "$_id",
              2
            ]
          }
        })
        .sort({ categories: 1 })
        .exec();
      

 
        

       

        res.status(200).json({status:200,message:'success' ,specialists })

        
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving data' });
      }
    },


   addAppointment : async (req, res) => {
      try {
        const dateString = req.body.date
       const localdate=moment(dateString, "DD/MM/YYYY").toDate()
        // create a new appointment object
        const newAppointment = new Appointment({
          date:localdate.toLocaleDateString(),
          timeslot: req.body.timeslot,
          services: req.body.serviceIds, // assuming you have an array of serviceIds in the form data
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
          res.status(200).json({status:200,message:"succesfull"})
        }).catch((err)=>{
          res.status(404).json({status:404,message:err.message})
        })
      } catch (error) {
  
        res.status(500).json({status:500,message:"internal error",err:error})
      }
  
  
  
    },


    

    bookingpage: async (req, res) => {
      try {
        const specialistId = req.body.specialistId;
    
        const today = new Date();
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
        const dates = [];
        const appointmentsByDate = [];
    
        // Get the next 7 days' dates
        for (let i = 0; i < 7; i++) {
          const date = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
          dates.push(date.toLocaleDateString());
        }
        console.log(dates);
    
        const appointments = await Appointment.find({
          specialistId: specialistId,
          date: { $in: dates }
        }).exec();
        console.log(appointments);
    
        // Group appointments by date
        for (const date of dates) {
          const appointmentsOfDay = appointments.filter(
            (appointment) => appointment.date === date
          );
          const timeSlots = ['9-10', '10-11', '11-12', '12-1', '2-3', '3-4', '4-5', '5-6'];
    
          // Remove time slots that have appointments booked
          appointmentsOfDay.forEach((appointment) => {
            const index = timeSlots.indexOf(appointment.timeslot);
            if (index !== -1) {
              timeSlots.splice(index, 1);
            }
          });
    
          // Add appointments to the result array
          appointmentsByDate.push({ date: date, timeSlots: timeSlots });
        }
    
        return res.status(200).json({ message: 'success', appointmentsByDate });
      } catch (error) {
        res.status(500).json({ message: 'error', error: error.message });
      }
    }
    
        



}
