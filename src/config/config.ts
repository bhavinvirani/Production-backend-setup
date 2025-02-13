import DotenvFlow from 'dotenv-flow'

DotenvFlow.config()

export default {
    ENV: process.env.NODE_ENV,
    PORT: process.env.PORT || 3000,
    SERVER_URL: process.env.SERVER_URL,

    // Database
    DATABASE_URI: process.env.DATABASE_URI,
    
}
