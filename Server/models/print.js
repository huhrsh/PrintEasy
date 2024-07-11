const mongoose = require('mongoose');
const cloudinary=require('../config/cloudinary')


const printSchema = new mongoose.Schema({
  files: {
    type: Array,
    require: true,
    default: []
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    require: true,
    ref: 'User',
    default: []
  },
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    require: true,
    ref: 'Shop',
    default: []
  },
  tokenNumber: {
    type: Number,
    require: true
  },
  priority: {
    type: Boolean,
    default: false
  },
  totalPrice: {
    type: Number,
    require: true
  },
  active: {
    type: Boolean,
    default: true
  },
  fileInfo: {
    type: Array,
    default: []
  },
}, {
  timestamps: true
});

// printSchema.statics.uploadFiles = async function (fileBuffers) {
//     try {
//       const uploadPromises = fileBuffers.map(fileBuffer =>
//         cloudinary.uploader.upload_stream({ folder: 'uploads/prints', resource_type: 'auto' }, (error, result) => {
//           if (error) {
//             throw new Error('Failed to upload files');
//           }
//           return result;
//         }).end(fileBuffer.data)
//       );
//       const results = await Promise.all(uploadPromises);
//       return results;
//     } catch (error) {
//       throw new Error('Failed to upload files');
//     }
//   };

const Print = mongoose.model('Print', printSchema);
module.exports = Print;
