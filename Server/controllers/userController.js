const User=require('../models/user')
const Shop=require('../models/shop');
const bcrypt=require('bcrypt')

module.exports.signUp=function(req,res){
    User.findOne({email:req.body.email})
    .then((user)=>{
        if(user){
            return res.send("Email already in use")
        }
        else{
            Shop.findOne({email:req.body.email})
            .then(async (shop)=>{
                if(shop){
                    return res.send("Email already in use")
                }
                else{
                    const hashedPassword = await bcrypt.hash(req.body.password, 10);
                    User.create(
                        {
                            ...req.body,
                            password:hashedPassword
                        }
                    )
                    .then((newUser)=>{
                        return res.send("Account created");
                    })
                    .catch((err)=>{
                        return res.send("Error in creating account");
                    })
                }
            })
            .catch((err)=>{
                return res.send("Error in creating account");
            })
        }
    })
    .catch((err)=>{
        res.send("Error in creating account");
        return;
    })
}


module.exports.signIn = async function (req, res) {
    try {
        const { email, password } = req.body;
        let userFound = await User.findOne({ email: email });
        if (userFound) {
            const isUserPasswordValid = await bcrypt.compare(password, userFound.password);
            if (!isUserPasswordValid) {
                return res.json({ message: "Incorrect password" });
            }
            return res.json({
                message: "Signed in",
                user: userFound
            });
        }

        // Check for shop if user not found
        let shopFound = await Shop.findOne({ email: email });
        if (shopFound) {
            const isShopPasswordValid = await bcrypt.compare(password, shopFound.password);
            if (!isShopPasswordValid) {
                return res.json({ message: "Incorrect password" });
            }
            return res.json({
                message: "Signed in",
                shop: shopFound
            });
        }

        // If neither user nor shop is found
        return res.json({ message: "Invalid credentials" });

    } catch (error) {
        console.error("Error during sign-in:", error);
        return res.status(500).json({ error: "Error in signing in" });
    }
};


module.exports.getUserData=(req,res)=>{
    // console.log(req.user)
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