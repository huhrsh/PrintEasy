const Shop=require('../models/shop')
const bcrypt=require('bcrypt')

module.exports.signUp=function(req,res){
    Shop.findOne({email:req.body.email})
    .then(async(shop)=>{
        if(shop){
            return res.send("Email already in use")
        }
        else{
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            Shop.create(
                {
                    userName:req.body.name,
                    shopName:req.body.addressl1,
                    email:req.body.email,
                    password:hashedPassword,
                    address:[req.body.addressl2,req.body.addressl3,req.body.addressl4],
                    phone:req.body.phone,
                    bnw:req.body.bnw,
                    color:req.body.color,
                    timings:{
                        open:req.body.openTime,
                        close:req.body.closeTime
                    }
                }
                )
                .then((newShop)=>{
                    // console.log("New Shop ",newShop);
                    return res.send("Account created");
                })
                .catch((err)=>{
                console.log(err)
                return res.send("Error in creating account");
            })
        }
    })
    .catch((err)=>{
        console.log(err)
        res.send("Error in creating account");
        return;
    })
}


// module.exports.signIn=async function(req,res){
//     console.log("Hi im beign called")
//     try {
//         const shopFound = await Shop.findOne({email:req.body.email });
//         if (!shopFound) {
//             return res.json( "Invalid credentials" );
//         }

//         if (shopFound.password !== req.body.password) {
//             return res.json("Incorrect password");
//         }

//         return res.json({
//             message: "Signed in",
//             shop:shopFound
//         });
//     } catch (error) {
//         console.error("Error during sign-in:", error);
//         return res.json("Error in signing in" );
//     }
// }


module.exports.getShopData=(req,res)=>{
    if(!req.user){
        return res.send("No user detected");
    }
}

module.exports.signOut=(req,res)=>{
    req.logout(function(err) {
        if (err) { 
            console.log(err);
         }
      });
}
module.exports.findShop = async (req, res) => {
    try {
        const searchText = req.body.inputValue.trim().toLowerCase(); 
        const responseArray = [];
        const shopList = await Shop.find();
        shopList.forEach((shop) => {
            let select = false;
            if (shop.shopId.toString().includes(searchText)) { 
                select = true;
            }
            if(!select){
                if(shop.shopName.toLowerCase().includes(searchText)){
                    select=true;
                }
            }
            if (!select) {
                const searchWords = searchText.split(/\s+/);
                const regexArray = searchWords.map(word => new RegExp(word, 'i'));
                select = shop.address.some((address) => regexArray.some(regex => regex.test(address.toLowerCase())));
            }

            if (select) {
                responseArray.push(shop);
            }
        });
        res.json(responseArray);
    } catch (err) {
        console.error("Error in fetching shops", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports.fetchShop=(req,res)=>{
    Shop.findById(req.body.shopId)
    .then((shop)=>{
        res.json({shop})
    })
    .catch((err)=>{
        res.json({statusText:"Error in fetching shop"})
    })
}

module.exports.changeStatus=(req,res)=>{
    let shopId=req.body.id
    Shop.findById(shopId)
    .then((shop)=>{
        // console.log("Shop status changed")
        if(shop.on){
            shop.tokenNumber=0;
        }
        else{
            shop.currentToken=0;
        }
        shop.on=!shop.on;
        shop.save();
        return res.status(400)
    })
    .catch((err)=>{
        console.log("Error in changing shop status",err)
        return res.status(500)
    })
}

module.exports.changePrintStatus=(req,res)=>{
    let shopId=req.body.id
    Shop.findById(shopId)
    .then((shop)=>{
        // console.log("Shop status changed")
        if(req.body.type=="color"){
            shop.colorPrints=!req.body.colorPrints
        }
        else if(req.body.type=='black'){
            shop.blackPrints=!req.body.blackPrints
        }
        shop.save();
        return res.send("Success")
    })
    .catch((err)=>{
        console.log("Error in changing shop status",err)
        return res.status(500).send("Eh")
    })
}