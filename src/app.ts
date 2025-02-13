import express, { Application, NextFunction, Request, Response } from 'express';
import path from 'path';
import router from './router/apiRouter';
import globalErrorHandler from './middleware/globalErrorHandler';
import responseMessage from './constant/responseMessage';
import httpError from './util/httpError';
import helmet from 'helmet';
import cors from 'cors';

const app: Application = express();

//? Middleware
app.use(helmet());
app.use(cors({
    origin: '*', // ['http://localhost:3000', 'http://localhost:3001']
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../', 'public')));

//? Routes
app.use('/api/v1', router);

//? 404 Error Handler
app.use((req: Request, _: Response, next: NextFunction) => {
    try {
        throw new Error(responseMessage.NOT_FOUND('Route'));
    } catch (err) {
        httpError(next, err, req, 404);
    }
});

//? Global Error Handler
app.use(globalErrorHandler);

export default app;