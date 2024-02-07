const mongoose=require('mongoose')

mongoose.connect('mongodb+srv://harshj2010:W6k2pwIcJ9MdircD@cluster0.nynygsd.mongodb.net/?retryWrites=true&w=majority')

const db=mongoose.connection;

db.on('error',(error)=>{console.log("Error in connecting to database: ",error)})

db.once('open',()=>{
    // console.log("Connected to database");
})

