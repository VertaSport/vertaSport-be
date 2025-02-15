import 'dotenv/config';
import z from 'zod';

const envVarsSchema = z.object({
    // SERVER
    PORT: z.coerce.number().default(8000),
    HOSTNAME: z.string().default('127.0.0.1'),
    MONGODB_URL_DEV: z.string().describe('Local Mongo DB'),
    // TOKEN
    JWT_ACCESS_TOKEN_KEY: z.string().min(1, { message: 'JWT Access Token Key là bắt buộc' }),
    JWT_VERIFY_TOKEN_KEY: z.string().min(1, { message: 'JWT Access Token Key là bắt buộc' }),
    JWT_VERIFY_EXPIRATION: z.string().default('5m'),
    JWT_ACCESS_EXPIRATION: z.string().default('15m'),
    // FIREBASE
    CLOUDINARY_API_KEY: z.string().describe('CLOUDINARY Api Key'),
    CLOUDINARY_CLOUD_NAME: z.string().describe('CLOUDINARY cloud name'),
    CLOUDINARY_API_SECRET: z.string().describe('CLOUDINARY api secret'),
    // NODEMAILER
    EMAIL_USER: z.string().email(),
    EMAIL_PASSWORD: z.string().min(3),
});

const result = envVarsSchema.safeParse(process.env);
if (!result.success) {
    result.error.issues.forEach((issue) => {
        console.error(`❌ Field "${issue.path.join('.')}" - ${issue.message}`);
    });
    console.error('⛔ Stopping application due to missing environment variables.');
    process.exit(1);
}

const envVars = result.data;
const config = {
    port: envVars.PORT,
    hostname: envVars.HOSTNAME,
    mongoose: {
        url: envVars.MONGODB_URL_DEV,
        options: {
            dbName: 'vertasport',
        },
    },
    jwt: {
        accessTokenKey: envVars.JWT_ACCESS_TOKEN_KEY,
        accessExpiration: envVars.JWT_ACCESS_EXPIRATION,
        verifyTokenKey: envVars.JWT_VERIFY_TOKEN_KEY,
        verifyExpiration: envVars.JWT_VERIFY_EXPIRATION,
    },
    cloudinaryConfig: {
        cloudName: envVars.CLOUDINARY_CLOUD_NAME,
        apiKey: envVars.CLOUDINARY_API_KEY,
        apiSecret: envVars.CLOUDINARY_API_SECRET,
    },
    nodeMailer: {
        email: envVars.EMAIL_USER,
        password: envVars.EMAIL_PASSWORD,
    },
};

export default config;
