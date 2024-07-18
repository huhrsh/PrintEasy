const express = require('express');
const port = 5000;
const http = require('http')
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser')
const db = require('./config/mongoose')
const session = require('express-session')
const passport = require('passport')
const passportLocal = require('./config/passportLocalStrategy');
const cookieParser = require('cookie-parser')
const MongoStore = require('connect-mongo');
const WebSocket = require('ws')
const env = require('./config/environment')
require('dotenv').config()
// const { notifyShop } = require('./WebSocket');
// const { server } = require('./WebSocket');
const app = express();

app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ extended: true }));

app.use(cors({
  origin: env.client_url,
  methods: "GET,POST,PUT,DELETE",
  credentials: true,
}));

app.use(session({
  name: env.session_name,
  secret: env.session_secret,
  saveUninitialized: false,
  resave: false,
  cookie: {
    httpOnly: true, 
    secure: process.env.name === 'production',
    sameSite: process.env.name==='production'?'None':"Lax", 
    maxAge: (1000 * 60 * 60 * 24 * 31)
  },
  store: MongoStore.create({
    mongoUrl: env.db,
    autoRemove: 'disabled',
  })
}))

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(passport.initialize());
app.use(passport.session());
app.use(passport.setAuthenticatedUser);

app.use('/', require('./routes'))

const { initWebSocketServer } = require('./WebSocket');
const server = http.createServer(app);

initWebSocketServer(server);

server.listen(port, (err) => {
  if (err) {
    console.log("Error in listening: ", err);
  } else {
    console.log("Listening on port: ", port);
  }
});

module.exports = {
  server,
  getWebSocketServer: () => wss,
};
