import DotenvFlow from 'dotenv-flow'

DotenvFlow.config()

export default {
    ENV: process.env.NODE_ENV,
    PORT: process.env.PORT || 3000,
    SERVER_URL: process.env.SERVER_URL,

    // Database
    DATABASE_URI: process.env.DATABASE_URI,

    // Frontend
    FRONTEND_URL: process.env.FRONTEND_URL,

    // Email service
    EMAIL_SERVICE_API_KEY: process.env.EMAIL_SERVICE_API_KEY,

    // Access token
    ACCESS_TOKEN:{
        SECRET: process.env.ACCESS_TOKEN_SECRET,
        EXPIRY: 3600
    },

    // Refresh Token
    REFRESH_TOKEN:{
        SECRET: process.env.REFRESH_TOKEN_SECRET,
        EXPIRY: 3600 * 24 * 365
    }
    
}
