const express = require('express');
const fileController = require('../controllers/fileController.js');
const path = require('path')
const multer = require('multer')
const upload = multer({ dest: path.join(__dirname, '..', 'uploads/files') })

const router = express.Router();

// router.use(passport.session());

router.post('/send', upload.array('file'), fileController.send);
router.post('/receive', fileController.receive);
router.post('/download', fileController.download);

module.exports = router;
