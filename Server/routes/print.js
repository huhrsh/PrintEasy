const express = require('express');
const printController = require('../controllers/printController.js');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const upload = multer({ dest: path.join(__dirname, '..', 'uploads/prints') })


// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/prints/');
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname)); 
//   }
// });

// const upload = multer({ storage: storage });

router.post('/new-print', upload.array('file'), printController.newPrint);
router.post('/get-print-info', printController.getPrintInfo);
router.post('/download', printController.download);
router.post('/single-download', printController.singleDownload);
router.post('/order-completed', printController.orderCompleted);
router.post('/get-pdf', printController.getPdf);

module.exports = router;
