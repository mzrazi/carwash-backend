var express = require('express');
const { userlogin, userSignup, verifyEmail,homepagedata, servicespage, addAppointment } = require('../controllers/apicontrol');
var router = express.Router();

/* GET home page. */
router.post('/login',userlogin);

router.post('/signup',userSignup)

router.get('/verify-email/:token',verifyEmail)


router.get('/home',homepagedata)

router.post('/services',servicespage)

router.post('/appointment',addAppointment)

module.exports = router;
