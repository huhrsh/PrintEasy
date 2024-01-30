const express=require('express')

const router=express.Router();

router.use('/shop',require('./shop'))
router.use('/users',require('./user'))
router.use('/file',require('./file'))
router.use('/print',require('./print'))

// console.log("Main router Loaded");

module.exports=router;