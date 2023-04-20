var express = require('express');
const { userlogin, userSignup, verifyEmail,homepagedata } = require('../controllers/apicontrol');
var router = express.Router();

/* GET home page. */
router.post('/login',userlogin);

router.post('/signup',userSignup)

router.get('/verify-email/:token',verifyEmail)


router.get('/home',homepagedata)

module.exports = router;
