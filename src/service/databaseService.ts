import mongoose from 'mongoose'
import config from '../config/config'

export default {
    connect: async () => {
        // Connect to database
        await mongoose.connect(config.DATABASE_URI as string)
        return mongoose.connection 
    }
}
