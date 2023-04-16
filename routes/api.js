var express = require('express');
const { userlogin, userSignup, verifyEmail } = require('../controllers/apicontrol');
var router = express.Router();

/* GET home page. */
router.post('/login',userlogin);

router.post('/signup',userSignup)

router.get('/verify-email/:token',verifyEmail)

module.exports = router;
