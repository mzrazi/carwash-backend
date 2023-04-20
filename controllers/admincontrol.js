const Contact=require('../models/contactmodel')

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


        
    }
}