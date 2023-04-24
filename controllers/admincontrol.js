const category = require('../models/categorymodel');
const Contact=require('../models/contactmodel');
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

     addservice : async (req, res) => {

      console.log(req.body);
      try {

        const cate = await category.findById(req.body.categoryId);
        console.log(cate);
        if (!cate) {
          return res.status(404).json({ message: 'Category not found' });
        }
        // create a new service object
        const newservice = new service({
          title: req.body.title,
          price: req.body.price,
          duration: req.body.duration,
          description: req.body.description,
          category: req.body.categoryId // assuming you have a categoryId in the form data
        });
    
        // save the service to the database
        const savedservice = await newservice.save();
    
        res.status(200).json({ message: 'service added successfully', service: savedservice });
      } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error adding service'+error });
      }
    }
}