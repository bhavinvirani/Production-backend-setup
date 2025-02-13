import { NextFunction, Request, Response } from 'express'
import httpResponse from '../util/httpResponse';
import responseMessage from '../constant/responseMessage';
import httpError from '../util/httpError';

export default {
    self: (req: Request, res: Response, next: NextFunction) => {
        try {
            // throw new Error('Test Error');
            httpResponse(req, res, 200, responseMessage.TEST);
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },
    
}
