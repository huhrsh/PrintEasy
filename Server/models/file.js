const mongoose=require('mongoose')
const multer=require('multer')
const path=require('path')
const PRODUCT_PATH = path.join('/uploads/files');
const fs=require('fs')

const fileSchema=new mongoose.Schema({
    files:{
        type: Array,
        default:[]
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }
},{
    timestamps:true
})

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname,'..', PRODUCT_PATH ));
    },
    filename: function (req, file, cb) {
        // console.log(file);
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
  });

  fileSchema.statics.uploadedFiles = multer({storage: storage});   
  fileSchema.statics.filesPath = PRODUCT_PATH;

  fileSchema.statics.cleanupOldFiles = async function () {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const files = await this.find({ 'createdAt': { $lt: twoHoursAgo } });
  
    files.forEach(async (file) => {
    // console.log("File is: ")
      file.files.forEach(async (filename) => {
        // console.log("File name is: ",filename)
        const filePath = path.join(__dirname, '..', PRODUCT_PATH, filename.filename); 
        // console.log("File Path is: ",filePath);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`Removed: ${filePath}`);
        }
      });
    });
  };
  setInterval(async () => {
    await mongoose.model('File').cleanupOldFiles();
  },  120*60*1000);  
  

const File=mongoose.model('File',fileSchema);
module.exports=File;