import app from './app';
import connectDB from './config/database.config';

const PORT = 5000;
const HOSTNAME = '0.0.0.0';

let server: any;
connectDB().then(async () => {
    server = app.listen(PORT, `${HOSTNAME}`, () => {
        console.log(`Listening to port ${PORT}`);
    });
});

const exitHandler = () => {
    if (server) {
        server.close(() => {
            console.log('Server closed');
            process.exit(1);
        });
    } else {
        process.exit(1);
    }
};

const unexpectedErrorHandler = (error: string) => {
    console.log(error);
    exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
    console.log('SIGTERM received');
    if (server) {
        server.close();
    }
});
