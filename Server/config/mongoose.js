const mongoose=require('mongoose')

mongoose.connect('mongodb://0.0.0.0/PrintEasy')

const db=mongoose.connection;

db.on('error',(error)=>{console.log("Error in connecting to database: ",error)})

db.once('open',()=>{
    console.log("Connected to database");
})

