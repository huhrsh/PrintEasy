const Shop=require('../models/shop')

module.exports.signUp=function(req,res){
    Shop.findOne({email:req.body.email})
    .then((shop)=>{
        if(shop){
            return res.send("Email already in use")
        }
        else{
            Shop.create(
                {
                    name:req.body.name,
                    email:req.body.email,
                    password:req.body.password,
                    address:[req.body.addressl1,req.body.addressl2,req.body.addressl3,req.body.addressl4],
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
                    console.log("New Shop ",newShop);
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
    // console.log(req.body);
}


module.exports.signIn=async function(req,res){
    console.log("***",req.body);
    try {
        const shopFound = await Shop.findOne({email:req.body.email });
        if (!shopFound) {
            return res.json( "Invalid credentials" );
        }

        if (shopFound.password !== req.body.password) {
            return res.json("Incorrect password");
        }

        // If sign-in is successful, send user data in the response
        return res.json({
            message: "Signed in",
            shop:shopFound
        });
    } catch (error) {
        console.error("Error during sign-in:", error);
        return res.json("Error in signing in" );
    }
}


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