const mongoose=require('mongoose')

const shopSchema=new mongoose.Schema({
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
    address:{
        type: Array,
        required:true
    },
    phone:{
        type: String,
        required:true
    },
    bnw:{
        type: Number,
        required:true
    },
    color:{
        type: Number,
        required:true
    },
    timings:{
        type: Object,
        required:true
    },
    shopId:{
        type:Number,
        required:true,
        default:10000
    }
},{
    timestamps:true
})

shopSchema.pre('save',function(next){
    this.shopId+=1;
    next();
})

const Shop=mongoose.model('Shop',shopSchema);
module.exports=Shop;