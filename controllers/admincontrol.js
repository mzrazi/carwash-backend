const Category = require('../models/categorymodel');
const Contact = require('../models/contactmodel');
const service = require('../models/servicemodel');





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
    }
    
  }