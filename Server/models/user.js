const mongoose=require('mongoose')

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    defaultAddress:{
        type:Object,
        default:{}
    },
    fileSent:{
        type: Array,
        default:[]
    },
    fileReceived:{
        type: Array,
        default:[]
    },
    filePrinted:{
        type: Array,
        default:[]
    },
    // printToken:{
    //     type:Array,
    //     default:[]
    // },
    activePrints:{
        type:Array,
        default:[]
    }
},{
    timestamps:true
})

const User=mongoose.model('User',userSchema);
module.exports=User;