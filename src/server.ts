import app from './app';
import config from './config/config';
import logger  from './util/logger';

const server = app.listen(config.PORT);

;(() => {
    try {
        logger.info('SERVER_STARTED', {
            meta:{
                port: config.PORT,
                env: config.ENV
            }
        });
    } catch (error) {
        logger.error('SERVER_ERROR: ', {meta:  error});
        server.close((error) => {
            if(error){
                logger.error('SERVER_CLOSE_ERROR: ', {meta:  error});
            }
            process.exit(1);
        });
    }  
})()

export default server;