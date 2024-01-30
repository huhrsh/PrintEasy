const mongoose=require('mongoose')
const multer=require('multer')
const path=require('path')
const PRODUCT_PATH = path.join('/uploads/prints');

const printSchema=new mongoose.Schema({
    files:{
        type: Array,
        require:true,
        default:[]
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        require:true,
        ref:'User',
        default:[]
    },
    shop:{
        type:mongoose.Schema.Types.ObjectId,
        require:true,
        ref:'Shop',
        default:[]
    },
    tokenNumber:{
        type:Number,
        require:true
    },
    priority:{
        type:Boolean,
        default:false
    },
    totalPrice:{
        type:Number,
        require:true
    },
    active:{
        type:Boolean,
        default:true
    },
    fileInfo:{
        type:Array,
        default:[]
    },
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

  printSchema.statics.uploadedFiles = multer({storage: storage});   
  printSchema.statics.filesPath = PRODUCT_PATH;

const Print=mongoose.model('Print',printSchema);
module.exports=Print;