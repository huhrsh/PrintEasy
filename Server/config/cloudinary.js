const cloudinary = require('cloudinary').v2;
const env=require('./environment')

cloudinary.config(env.cloudinary);

module.exports = cloudinary;
