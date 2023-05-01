var express = require('express');
const { userlogin, userSignup, verifyEmail,homepagedata, servicespage, addAppointment, savemessage, bookingpage } = require('../controllers/apicontrol');
var router = express.Router();

/* GET home page. */
router.post('/login',userlogin);

router.post('/signup',userSignup)

router.get('/verify-email/:token',verifyEmail)


router.get('/home',homepagedata)

router.post('/services',servicespage)

router.post('/appointment',addAppointment)
router.post('/booking-page',bookingpage)


router.post("/message",savemessage)
 
module.exports = router;
