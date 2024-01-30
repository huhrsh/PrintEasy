const passport=require('passport')
const localStrategy=require('passport-local').Strategy;
const User=require('../models/user')
const Shop=require('../models/shop')

// passport.use(new localStrategy({
//     usernameField:'email',
//     // passReqToCallback:true
//     },
//     function(email,password,done){
//         User.findOne({email:email})
//         .then((userFound)=>{
//             if(!userFound){
//                 Shop.findOne({email:email})
//                 .then((shopFound)=>{
//                     if(!shopFound){
//                         // res.send("User does not exit")
//                         console.log("Shop does not exit")
//                         return done(null,false)
//                     }
//                     if(shopFound.password!==password){
//                         // res.send("Password does not match")
//                         console.log("Password does not match")
//                         return done(null,false)
//                     }
//                     // res.send("Signed in.")
//                     console.log("Signed in.")
//                     return done(null,shopFound);
//                 })
//                 .catch((err)=>{
//                     return done(err);
//                 })
//                 // res.send("User does not exit")
//                 console.log("User does not exit")
//                 return done(null,false)
//             }
//             if(userFound.password!==password){
//                 // res.send("Password does not match")
//                 console.log("Password does not match")
//                 return done(null,false)
//             }
//             // res.send("Signed in.")
//             console.log("Signed in.")
//             return done(null,userFound);
//         })
//         .catch((err)=>{
//             return done(err);
//         })
//     }
// ))

passport.use(new localStrategy({
    usernameField: 'email',
},
function (email, password, done) {
    User.findOne({ email: email })
        .then((userFound) => {
            if (userFound) {
                if (userFound.password === password) {
                    console.log("User signed in.");
                    return done(null, userFound);
                } else {
                    console.log("Password does not match");
                    return done(null, false, { message: "Incorrect password" });
                }
            } else {
                Shop.findOne({ email: email })
                    .then((shopFound) => {
                        if (shopFound) {
                            if (shopFound.password === password) {
                                console.log("Shop signed in.");
                                return done(null, shopFound);
                            } else {
                                console.log("Password does not match");
                                return done(null, false, { message: "Incorrect password" });
                            }
                        } else {
                            console.log("User/Shop does not exist");
                            return done(null, false, { message: "User/Shop does not exist" });
                        }
                    })
                    .catch((err) => {
                        return done(err);
                    });
            }
        })
        .catch((err) => {
            return done(err);
        });
}));


// passport.use(new localStrategy({
//     usernameField:'email',
//     // passReqToCallback:true
//     },
//     function(email,password,done){
//         Shop.findOne({email:email})
//         .then((shopFound)=>{
//             if(!shopFound){
//                 // res.send("User does not exit")
//                 console.log("Shop does not exit")
//                 return done(null,false)
//             }
//             if(shopFound.password!==password){
//                 // res.send("Password does not match")
//                 console.log("Password does not match")
//                 return done(null,false)
//             }
//             // res.send("Signed in.")
//             console.log("Signed in.")
//             return done(null,shopFound);
//         })
//         .catch((err)=>{
//             return done(err);
//         })
//     }
// ))


passport.serializeUser((user,done)=>{
    done(null,user.id);
})

passport.deserializeUser((id,done)=>{
    // console.log("lasan")
    User.findById(id)
    .then((userFound)=>{
        // console.log("User is: ",userFound)
        if(userFound){
            done(null,userFound);
        }
        else{
            Shop.findById(id)
            .then((shopFound)=>{
                // console.log("Shop is: ",shopFound)
                done(null,shopFound);
            })
            .catch((err)=>{
                done(err);
            })
        }
    })
    .catch((err)=>{
        done(err);
    })
})

passport.checkAuthentication=function(req,res,next){
    if(req.isAuthenticated()){
        // console.log("No shit")
        return next();
    }
    else{
        // console.log("Shit")
        return res.send("Error in authenticating");
    }
}

passport.setAuthenticatedUser=function(req,res,next){
    // console.log("Inside Set Authenticater");
    // console.log(req.body);
    if(req.isAuthenticated()){
        res.json(req.user);
    }
    next();
}

module.exports=passport