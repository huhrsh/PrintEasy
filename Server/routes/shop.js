const express=require('express')
const shopController=require('../controllers/shopController');
const passport = require('passport');

const router=express.Router();

router.use(passport.session())

// console.log("Shop router Loaded");

router.post('/sign-up',shopController.signUp);

// router.post('/sign-in', passport.authenticate(
//     'local',
//     {failureRedirect: '/shop/sign-in'}
// ), shopController.signIn)

router.post('/get-shop-data',passport.checkAuthentication,shopController.getShopData)

router.post('/sign-out',shopController.signOut)
// router.post('/find-shop',passport.checkAuthentication,shopController.findShop)
router.post('/find-shop',shopController.findShop)

router.post('/fetch-shop',shopController.fetchShop)

router.post('/change-status',shopController.changeStatus)

router.post('/change-print-status',shopController.changePrintStatus)

module.exports=router;