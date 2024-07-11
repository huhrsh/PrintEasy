const mongoose=require('mongoose')
const env=require('./environment')

mongoose.connect(env.db)

const db=mongoose.connection;

db.on('error',(error)=>{console.log("Error in connecting to database: ",error)})

db.once('open',()=>{
    // console.log("Connected to database");
})

