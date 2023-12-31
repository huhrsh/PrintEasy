const express=require('express')
const fileController=require('../controllers/fileController.js');
const File=require('../models/file.js')
const router=express.Router();
const passport=require('passport')

router.use(passport.session())

console.log("File router Loaded");

router.post('/send',File.uploadedFiles.array('file'),fileController.send);

router.post('/receive',fileController.receive);

router.post('/download',fileController.download);

module.exports=router;