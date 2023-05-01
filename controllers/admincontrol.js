const Category = require('../models/categorymodel');
const Contact = require('../models/contactmodel');
const service = require('../models/servicemodel');
const User = require('../models/usermodel');
const admin = require('firebase-admin');




const serviceAccount = require(process.env.GOOGLE_APPLICATION_CREDENTIALS);
admin.initializeApp({credential: admin.credential.cert(serviceAccount)});

module.exports={
    addContact:async(req,res)=>{

        const { phoneNumber, whatsappNumber } = req.body;
  console.log(req.body);
        try {
          let contact = await Contact.findOne();
          if (contact) {
            contact.phoneNumber = phoneNumber;
            contact.whatsappNumber = whatsappNumber;
            await contact.save();
            res.status(200).json({ message: 'Contact information updated successfully.' });
          } else {
            contact = new Contact({ phoneNumber, whatsappNumber });
            await contact.save();
            res.status(200).json({ message: 'Contact information added successfully.' });
          }
        } catch (error) {
          res.status(500).json({ message:error ,errmessage: 'Failed to save contact information.' });
        }


        
    },

    addservice: async (req, res) => {
      console.log(req.body);
    
      try {
        const categoryId = req.body.categoryId;
    
        // Check if the category exists
        const category = await Category.findById(categoryId);
        if (!category) {
          return res.status(404).json({ message: 'Category not found' });
        }
    
        // Create a new service object
        const newService = new service({
          title: req.body.title,
          price: req.body.price,
          duration: req.body.duration,
          description: req.body.description,
          category: categoryId
        });
    
        // Save the service to the database
        const savedService = await newService.save();
    
        // Add the service ID to the services array of the category
        await Category.findByIdAndUpdate(categoryId, {
          $push: { services: savedService._id }
        });
    
        res.status(200).json({ message: 'Service added successfully', service: savedService });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error adding service' });
      }
    },
    
    announce:(data)=>{
    
      const { title, message,selectedUsers} = data;
  
    // Create a new document using the model
    const newAnnounce = new announcemodel({ title, message,user:selectedUsers });
  
    // Save the document to the database
    newAnnounce.save((err) => {
      if (err) {
        // Handle any validation errors
        const validationErrors = Object.values(err.errors).map(error => error.message);
        return validationErrors
      } else {
       return true
      }
    });
    },


    sendnotification:async(req,res)=>{
      const { title, message, selectedUsers } = req.body;
      console.log(req.body);
    
      try {
        // If "Select All" is checked, retrieve all email-verified users' tokens
        let tokens = [];
        if (selectedUsers === 'all') {
          const users = await User.find({ emailverified: true });
          tokens = users.flatMap((user) => user.tokens);
          console.log(tokens);
        } else { // Find the specific user and retrieve their token
          const user = await User.findOne({ _id: selectedUsers });
          if (!user) {
            throw new Error('User not found');
          }
          tokens = user.tokens;
        }
    
        if (tokens.length === 0) {
          throw new Error('No valid tokens found');
        }
    
        // Remove any invalid tokens
        const response = await admin.messaging().sendMulticast({
          tokens,
          notification: {
            title: title,
            body: message
          }
        });
        console.log('FCM response:', response);
    
        const invalidTokens = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            invalidTokens.push(tokens[idx]);
          }
        });
    
        if (invalidTokens.length > 0) { // Remove invalid tokens from user's tokens array
          await User.updateMany({
            tokens: {
              $in: invalidTokens
            }
          }, {
            $pull: {
              tokens: {
                $in: invalidTokens
              }
            }
          });
        }
       
    
        // Call announce function only if notification is sent successfully
        // announce(req.body);
    
        // Send JSON response if notification sent successfully
        res.json({
          message: 'Notification sent successfully'
        });
      } catch (error) {
        console.error(error);
    
        // Send appropriate error message in JSON response
        if (error.code === 'messaging/invalid-argument' && error.message === 'tokens must be a non-empty array') {
          res.status(400).json({
            error: 'No valid tokens found',
            message: 'No valid tokens found'
          });
        } else if (error.message === 'User not found') {
          res.status(404).json({
            error: 'User not found',
            message: 'User not found'
          });
        } else {
          res.status(500).json({
            error: 'Internal server error',
            message: 'An internal server error occurred'
          });
        }
      }
    }
    }
    
  