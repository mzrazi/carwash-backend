var express = require('express');
var router = express.Router();
const multer=require('multer')
var mongoose = require('mongoose')
var Offer=require('../models/offersmodel')
var path=require('path')
var Category=require('../models/categorymodel');
const { log } = require('console');
const specialist = require('../models/specialistmodel');
const fs = require('fs');
const { addContact, addservice, sendnotification, workersendnotification } = require('../controllers/admincontrol');







const storageImages = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './public/images/categories');
  },
  filename: function(req, file, cb) {
    cb(null, `file-${Date.now()}-${Math.random()}${path.extname(file.originalname)}`);
  }
});

const storageOffers = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './public/images/offers');
  },
  filename: function(req, file, cb) {
    cb(null, `file-${Date.now()}-${Math.random()}${path.extname(file.originalname)}`);
  }
});
const storagespecialists = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './public/images/specialists');
  },
  filename: function(req, file, cb) {
    cb(null, `file-${Date.now()}-${Math.random()}${path.extname(file.originalname)}`);
  }
});

const uploadCategories = multer({ storage: storageImages });
const uploadOffers = multer({ storage: storageOffers });
const uploadSpecialist = multer({ storage:storagespecialists });

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/add-offers',uploadOffers.single('image'),async(req,res)=>{
var newoffer= new Offer({
  imagepath:`/images/offers/${req.file.filename}`
})
 try { 
 await newoffer.save() 
  res.status(200).json({message:'done'})
} catch (error) {
  fs.unlink(req.file.path, (err) => {
    if (err) console.log(err);
    console.log(`${req.file.path} was deleted`);
  });
  res.status(500).json({message:'error'})
}

})

router.post('/add-category',uploadCategories.single('image'),async(req,res)=>{

  console.log(req.body);
  var data=req.body
  var newcategory= new Category({
    title:data.title,
    imagepath:`/images/categories/${req.file.filename}`
  })
   try { 
   await newcategory.save() 
    res.status(200).json({message:'done',newcategory})
  } catch (error) {
    fs.unlink(req.file.path, (err) => {
      if (err) console.log(err);
      console.log(`${req.file.path} was deleted`);
    });
    res.status(500).json({message:'error'+error})
  }
  
  })

  router.post('/add-specialist',uploadSpecialist.single('image'),async(req,res)=>{
    var data=req.body
    console.log(data);
   
    var newspecialist= new specialist({
      name:data.name,
      categories:data.categoryId,
      whatsapp:data.whatsappNumber,
      email:data.email,
      password:data.password,
      imagepath:`/images/specialists/${req.file.filename}`
    })
     try { 
     await newspecialist.save() 
      res.status(200).json({message:'done'})
    } catch (error) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.log(err);
        console.log(`${req.file.path} was deleted`);
      });
      res.status(500).json({message:error,newspecialist})
    }
    
    }) 
 

    router.post('/add-contact',addContact) 

    router.post('/add-service',addservice)

    router.post('/send-notification',sendnotification)

    router.post('/worker-sendnoti',workersendnotification)
  
  



module.exports = router;
