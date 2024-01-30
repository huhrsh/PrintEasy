const express=require('express');
const port=5000;
const http=require('http')
const path=require('path');
const cors = require('cors');
const bodyParser=require('body-parser')
const db=require('./config/mongoose')
const session=require('express-session')
const passport=require('passport')
const passportLocal=require('./config/passportLocalStrategy');
const cookieParser=require('cookie-parser')
const MongoStore=require('connect-mongo');
const WebSocket=require('ws')
// const { notifyShop } = require('./WebSocket');
// const { server } = require('./WebSocket');
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
        maxAge:(1000*60*60*24*31)     
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


// const server = http.createServer(app);
// const wss = new WebSocket.Server({ noServer: true });

// wss.on('connection', (ws, req) => {
//   // Handle WebSocket connections
//   console.log('New WebSocket connection');

//   ws.on('message', (message) => {
//     console.log(`Received message: ${message}`);
//   });
// });

// // Upgrade HTTP requests to WebSocket
// server.on('upgrade', (request, socket, head) => {
//   wss.handleUpgrade(request, socket, head, (ws) => {
//     wss.emit('connection', ws, request);
//   });
// });
// function notifyShop(shopId, printId){
//     console.log("Shava Shava")
//   wss.clients.forEach((client) => {
//     if (client.readyState === WebSocket.OPEN) {
//       client.send(JSON.stringify({ type: 'new print', shopId, printId }));
//     }
//   });
// }
const { initWebSocketServer } = require('./WebSocket');
const server = http.createServer(app);
// const wss = new WebSocket.Server({ server });

initWebSocketServer(server);

// wss.on('connection', (ws, req) => {
//   console.log('New WebSocket connection');

//   ws.on('message', (message) => {
//     console.log(`Received message: ${message}`);
//   });
// });

server.listen(port, (err) => {
  if (err) {
    console.log("Error in listening: ", err);
  } else {
    console.log("Listening on port: ", port);
  }
});

module.exports = {
  server,
//   wss
getWebSocketServer: () => wss,
};