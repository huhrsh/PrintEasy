const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('../models/user');
const Shop = require('../models/shop');

passport.use(new localStrategy({
    usernameField: 'email',
},
async function (email, password, done) {
    try {
        const userFound = await User.findOne({ email });
        // console.log(userFound)
        if (userFound) {
            const isMatch = await bcrypt.compare(password, userFound.password);
            if (isMatch) {
                // console.log("User signed in.");
                return done(null, userFound);
            } else {
                // console.log("Password does not match");
                return done(null, false, { message: "Incorrect password" });
            }
        } else {
            const shopFound = await Shop.findOne({ email });
            if (shopFound) {
                const isMatch = await bcrypt.compare(password, shopFound.password);
                if (isMatch) {
                    // console.log("Shop signed in.");
                    return done(null, shopFound);
                } else {
                    // console.log("Password does not match");
                    return done(null, false, { message: "Incorrect password" });
                }
            } else {
                // console.log("User/Shop does not exist");
                return done(null, false, { message: "User/Shop does not exist" });
            }
        }
    } catch (err) {
        console.log(err)
        return done(err);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const userFound = await User.findById(id);
        if (userFound) {
            done(null, userFound);
        } else {
            const shopFound = await Shop.findById(id);
            done(null, shopFound);
        }
    } catch (err) {
        done(err);
    }
});

passport.checkAuthentication = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        return res.send("Error in authenticating");
    }
};

passport.setAuthenticatedUser = function (req, res, next) {
    if (req.isAuthenticated()) {
        res.json(req.user);
    }
    next();
};

module.exports = passport;
