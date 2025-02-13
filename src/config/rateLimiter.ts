import { Connection } from 'mongoose';
import { RateLimiterMongo } from 'rate-limiter-flexible';

export let rateLimiterMongo: null | RateLimiterMongo = null;

const DURATION = 60; // Duration in seconds
const POINTS = 10; // Number of points

export const initRateLimiter = (mongooseConnection: Connection) => {
    rateLimiterMongo = new RateLimiterMongo({
        storeClient: mongooseConnection,
        points: POINTS,
        duration: DURATION,
    });
};