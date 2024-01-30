const express=require('express')
const printController=require('../controllers/printController.js');
const Print=require('../models/print.js')
const router=express.Router();
const passport = require('passport');

// console.log("Print router Loaded");

// router.post('/send',File.uploadedFiles.array('file'),fileController.send);

router.post('/new-print',Print.uploadedFiles.array('file'),printController.newPrint)

router.post('/get-print-info',printController.getPrintInfo)

router.post('/download',printController.download)

router.post('/single-download',printController.singleDownload)

router.post('/order-completed',printController.orderCompleted)
// router.post('/receive',fileController.receive);

// router.post('/download',fileController.download);

module.exports=router;