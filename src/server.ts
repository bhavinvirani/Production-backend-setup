import app from './app';
import config from './config/config';

const server = app.listen(config.PORT);

;(() => {
    try {
        // eslint-disable-next-line no-console
        console.info('SERVER_STARTED', {
            meta:{
                port: config.PORT,
                env: config.ENV
            }
        });
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('SERVER_ERROR: ', {meta:  error});
        server.close((error) => {
            if(error){
                // eslint-disable-next-line no-console
                console.error('SERVER_CLOSE_ERROR: ', {meta:  error});
            }
            process.exit(1);
        });
    }  
})()

export default server;