require('dotenv').config()

const development={
    db:process.env.DEV_DATABASE_URL,
    client_url:process.env.DEV_CLIENT_URL,
    cloudinary: {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    },
    session_name:process.env.SESSION_NAME,
    session_secret:process.env.SESSION_SECRET,

}

const production={
    db:process.env.PROD_DATABASE_URL,
    client_url:process.env.PROD_CLIENT_URL,
    cloudinary: {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    },
    session_name:process.env.SESSION_NAME,
    session_secret:process.env.SESSION_SECRET,
}

module.exports=process.env.environment=='development'?development:production;