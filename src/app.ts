import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import 'dotenv/config';
import express, { Express, NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { corsOptions } from './config/cors.config';
import { v2 as cloudinary } from 'cloudinary';
import errorHandler from './middlewares/errorHandlerMiddleware';
import notFoundHandler from './middlewares/notFoundHandlerMiddleware';
import router from './routes';
import cloudinaryConfig from './config/cloudinary.config';
import { handleInsertData } from '@/mock';
import { payosController } from './controllers';

const app: Express = express();
cloudinary.config(cloudinaryConfig);
app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(helmet());
app.use(compression());

app.use(cookieParser());

app.use(
    express.json({
        limit: '5mb',
    }),
);
app.use(express.urlencoded({ extended: true }));

// webhook
app.use('/webhook', payosController.HandlePayOsWebhook);

// routes
app.use('/api/v1', router);
app.get('/import-data', handleInsertData);
app.get('/', (req: Request, res: Response) => {
    res.send('Hello World');
});
//error middleware
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
