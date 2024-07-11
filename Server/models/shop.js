const mongoose=require('mongoose')

const shopSchema=new mongoose.Schema({
    userName:{
        type:String,
        required:true
    },
    shopName:{
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
        unique:true,
        default:10000
    },
    blackPrints:{
        type:Boolean,
        default:true
    },
    colorPrints:{
        type:Boolean,
        default:true
    },
    tokenNumber:{
        type:Number,
        default:0
    },
    currentToken:{
        type:Number,
        default:0
    },
    currentOrders:{
        type:Array,
        default:[]
    },
    currentPriorityOrders:{
        type:Array,
        default:[]
    },
    totalOrders:{
        type:Array,
        default:[]
    },
    on:{
        type:Boolean, 
        default:false
    }
},{
    timestamps:true
})

shopSchema.pre('save',function(next){
    if (this.isNew) {
        this.shopId = this.shopId + 6 || 10000;
    }
    // next();
    next();
})

const Shop=mongoose.model('Shop',shopSchema);
module.exports=Shop;