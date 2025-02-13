import app from './app';
import config from './config/config';
import { initRateLimiter } from './config/rateLimiter';
import databaseService from './service/databaseService';
import logger  from './util/logger';

const server = app.listen(config.PORT);

;void (async () => {
    try {

        // Connect to database
        const dbConnection = await databaseService.connect();
        logger.info('DATABASE_CONNECTED', {
            meta: {
                CONNECTION_NAME: dbConnection.name,
            }
        });

        initRateLimiter(dbConnection);
        logger.info('RATE_LIMITER_INITIALIZED');

         
        logger.info('SERVER_STARTED', {
            meta:{
                port: config.PORT,
                env: config.ENV
            }
        });
    } catch (error) {
        logger.error('SERVER_ERROR', {meta:  error});
        server.close((error) => {
            if(error){
                logger.error('SERVER_CLOSE_ERROR: ', {meta:  error});
            }
            process.exit(1);
        });
    }  
})()

export default server;