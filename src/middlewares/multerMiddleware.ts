import { BadRequestError } from '@/error/customError';
import multer from 'multer';

const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|webp)$/)) {
            return cb(new BadRequestError('Chỉ chấp nhận những file có đuôi là JPG, JPEG, PNG hoặc WEBP!'));
        }
        cb(null, true);
    },
    limits: { fileSize: 5 * 1024 * 1024 },
});

export default upload;
