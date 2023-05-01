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
    editProfile,
    userdetails,
    userCancelAppointment,
    completedjob,
    addreview
} = require('../controllers/apicontrol');
var router = express.Router();

/* GET home page. */
router.post('/login', userlogin);
router.post('/signup', userSignup)
router.get('/verify-email/:token', verifyEmail)
router.get('/home', homepagedata)
router.post('/services', servicespage)
router.post("/user-details", userdetails)
router.put('/edit-profile', editProfile)
router.post('/appointment', addAppointment)
router.post('/booking-page', bookingpage)
router.post("/message", savemessage)
router.post('/user-cancel',userCancelAppointment)
router.post('/complete-job',completedjob)
router.post('/add-review',addreview)

module.exports = router;

