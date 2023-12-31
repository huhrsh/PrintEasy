const express=require('express');
const port=5000;
const path=require('path');
const cors = require('cors');
const bodyParser=require('body-parser')
const db=require('./config/mongoose')
const session=require('express-session')
const passport=require('passport')
const passportLocal=require('./config/passportLocalStrategy');
const cookieParser=require('cookie-parser')
const MongoStore=require('connect-mongo');
const app=express();

app.use(cookieParser())
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json({extended:true}));

app.use(cors({
    origin: "http://localhost:3000",
    methods: "GET,POST,PUT,DELETE", 
    credentials: true,
  }));


app.use(session({
    name:'PrintEasy',
    secret:"B82D84F1999538EA596EA1B1F4B44",
    saveUninitialized:false,
    resave:false,
    cookie:{
        maxAge:(1000*60*24*31)     
    },
    store:MongoStore.create({
        mongoUrl:'mongodb://0.0.0.0/PrintEasy',
        autoRemove:'disabled'
    })
}))

app.use(passport.initialize());
app.use(passport.session());
app.use(passport.setAuthenticatedUser);

app.use('/',require('./routes'))

app.listen(port,(err)=>{
    if(err){
        console.log("Error in listening: ",err);
    }
    console.log("Listening on port: ",port);
})