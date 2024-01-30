const User=require('../models/user')
const Shop=require('../models/shop');

module.exports.signUp=function(req,res){
    console.log("Sign up controller");
    User.findOne({email:req.body.email})
    .then((user)=>{
        if(user){
            return res.send("Email already in use")
        }
        else{
            Shop.findOne({email:req.body.email})
            .then((shop)=>{
                if(shop){
                    return res.send("Email already in use")
                }
                else{
                    User.create(
                        req.body
                    )
                    .then((newUser)=>{
                        console.log("New User ",newUser);
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
    // console.log(req.body);
}

// module.exports.signIn=async function(req,res){
//     console.log(req.body);
//     console.log("Sign In controller");
//     try {
//         const userFound = await User.findOne({email:req.body.email });

//         if (!userFound) {
//             res.json({message: "Invalid credentials"});
//         }

//         else if (userFound.password !== req.body.password) {
//             res.json({message:"Incorrect password"});
//         }

//         // If sign-in is successful, send user data in the response
//         else{
//             return res.json({
//             message: "Signed in",
//             user:userFound
//         });
//         }
//     } catch (error) {
//         console.error("Error during sign-in:", error);
//         return res.json("Error in signing in" );
//     }
// }

// module.exports.signIn = async function (req, res) {
//     console.log("Sign in body is: ", req.body);
//     console.log("Sign In controller");
//     try {
//         const userFound = await User.findOne({ email: req.body.email });

//         if (!userFound) {
//             const shopFound = await Shop.findOne({ email: req.body.email });

//             if (!shopFound) {
//                 return res.json({ message: "Invalid credentials" });
//             } else if (shopFound.password !== req.body.password) {
//                 return res.json({ message: "Incorrect password" });
//             } else {
//                 return res.json({
//                     message: "Signed in",
//                     shop: shopFound
//                 });
//             }
//         } else if (userFound.password !== req.body.password) {
//             return res.json({ message: "Incorrect password" });
//         } else {
//             return res.json({
//                 message: "Signed in",
//                 user: userFound
//             });
//         }
//     } catch (error) {
//         console.error("Error during sign-in:", error);
//         // Send an error response if there's an issue
//         return res.status(500).json({ error: "Error in signing in" });
//     }
// };
    
module.exports.signIn = async function (req, res) {
    console.log("Sign in body is: ", req.body);
    console.log("Sign In controller");

    try {
        const userFound = await User.findOne({ email: req.body.email });

        if (!userFound) {
            const shopFound = await Shop.findOne({ email: req.body.email });

            if (!shopFound) {
                return res.json({ message: "Invalid credentials" });
            } else if (shopFound.password !== req.body.password) {
                return res.json({ message: "Incorrect password" });
            } else {
                return res.json({
                    message: "Signed in",
                    shop: shopFound
                });
            }
        } else if (userFound.password !== req.body.password) {
            return res.json({ message: "Incorrect password" });
        } else {
            return res.json({
                message: "Signed in",
                user: userFound
            });
        }
    } catch (error) {
        console.error("Error during sign-in:", error);
        // Send an error response if there's an issue
        return res.status(500).json({ error: "Error in signing in" });
    }
};


module.exports.getUserData=(req,res)=>{
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