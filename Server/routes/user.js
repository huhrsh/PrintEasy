const express=require('express')
const userController=require('../controllers/userController');
const passport = require('passport');

const router=express.Router();

// router.use(passport.session())

// console.log("User router Loaded");

router.post('/sign-up',userController.signUp);

router.post('/sign-in', passport.authenticate(
    'local',
    {failureRedirect: '/users/sign-in'}
), userController.signIn)

router.post('/get-user-data',passport.checkAuthentication,userController.getUserData)

router.post('/sign-out',userController.signOut)

module.exports=router;