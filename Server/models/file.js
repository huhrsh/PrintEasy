const mongoose = require('mongoose');
const cloudinary = require('../config/cloudinary');
const schedule = require('node-schedule');

const fileSchema = new mongoose.Schema({
  files: {
    type: Array,
    default: []
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  deletionTime: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

fileSchema.methods.scheduleDeletion = function () {
  const deletionTime = this.deletionTime;

  schedule.scheduleJob(deletionTime, async () => {
    this.files.forEach(async (fileRecord) => {
      const publicId = fileRecord.public_id;
      if (publicId) {
        try {
          const result = await cloudinary.uploader.destroy(publicId);
          // console.log(`Removed: ${publicId}`, result);
        } catch (error) {
          console.error(`Error removing ${publicId} from Cloudinary:`, error);
        }
      }
    });

    await this.deleteOne();
    // console.log(`File document removed: ${this._id}`);
  });
};

fileSchema.post('save', function (doc) {
  doc.scheduleDeletion();
});

const File = mongoose.model('File', fileSchema);
module.exports = File;
