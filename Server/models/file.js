const mongoose=require('mongoose')
const multer=require('multer')
const path=require('path')
const PRODUCT_PATH = path.join('/uploads/files');

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

const File=mongoose.model('File',fileSchema);
module.exports=File;