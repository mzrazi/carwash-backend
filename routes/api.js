var express = require('express');
const {
    userlogin,
    userSignup,
    verifyEmail,
    homepagedata,
    servicespage,
    addAppointment,
    savemessage,
    bookingpage,
   
    userdetails,
    userCancelAppointment,
    completedjob,
    addreview,
    getAppointmentHistory,
    getAllNotifications,
    unreviewed
} = require('../controllers/apicontrol');
var router = express.Router();
const multer=require('multer')
const User=require('../models/usermodel')
var path=require('path')
const fs = require('fs');




const storageImages = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, './public/images/userpic');
    },
    filename: function(req, file, cb) {
      cb(null, `file-${Date.now()}-${Math.random()}${path.extname(file.originalname)}`);
    }
  });

  const uploadProfilepic = multer({ storage: storageImages });

/* GET home page. */
router.post('/login', userlogin);
router.post('/signup', userSignup)
router.get('/verify-email/:token', verifyEmail)
router.get('/home', homepagedata)
router.post('/services', servicespage)
router.post("/user-details", userdetails)
router.put('/edit-profile', uploadProfilepic.single('image'), async (req, res) => {
  try {
    // Find user by id
    var updates = req.body;
    var ID = req.body.userId;

    if (req.file) {
      // Delete previous image if exists
      const user = await User.findById(ID);
      if (user.imagepath) {
        fs.unlink(path.join(__dirname, '..', 'public', user.imagepath), (err) => {
          if (err) console.log(err);
          console.log(`${user.imagepath} was deleted`);
        });
      }

      // Update image path
      updates.imagepath = `/images/userpic/${req.file.filename}`;
    }

    // Update user details
    const updatedUser = await User.findOneAndUpdate(
      { _id: ID },
      { $set: updates },
      { new: true }
    );

    return res.status(200).json({ status: 200, message: "Profile updated successfully", updatedUser });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 500, message: "error updating profile", err: error });
  }
});
router.post('/appointment', addAppointment)
router.post('/booking-page', bookingpage)
router.post("/message", savemessage)
router.post('/user-cancel',userCancelAppointment)
router.post('/complete-job',completedjob)
router.post('/add-review',addreview)
router.post('/get-appointments',getAppointmentHistory)
router.post('/user-notifications',getAllNotifications)
router.post('/review-page',unreviewed)

module.exports = router;

