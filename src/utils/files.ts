import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import { getCurrentDateTime } from './datetime';

const generateUniqueId = () => `${Date.now()}-${Math.floor(Math.random() * 10000)}`;

export const uploadSingleFile = async (
    file: Express.Multer.File,
    folder?: string,
): Promise<{ downloadURL: string; urlRef: string; originNames: string[] }> => {
    const dateTime = getCurrentDateTime();
    const uniqueId = generateUniqueId();

    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: folder || 'uploads',
                resource_type: 'auto',
                public_id: `${file.originalname}-${dateTime}-${uniqueId}`,
            },
            (error, result) => {
                if (error) return reject(error);
                if (!result) return reject(new Error('Upload failed'));

                resolve({
                    downloadURL: result.secure_url,
                    urlRef: result.public_id,
                    originNames: [file.originalname],
                });
            },
        );

        streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
};

export const uploadFiles = async (
    files: Express.Multer.File[],
    folder?: string,
): Promise<{ fileUrls: string[]; fileUrlRefs: string[]; originNames: string[] }> => {
    try {
        const uploadedFiles = await Promise.all(files.map((file) => uploadSingleFile(file, folder)));

        return {
            fileUrls: uploadedFiles.map((file) => file.downloadURL),
            fileUrlRefs: uploadedFiles.map((file) => file.urlRef),
            originNames: uploadedFiles.map((file) => file.originNames[0]),
        };
    } catch (error) {
        console.error('Error uploading multiple files:', error);
        throw error;
    }
};

export const getListAllFilesStorage = async (folderName: string): Promise<string[]> => {
    try {
        const result = await cloudinary.api.resources({
            type: 'upload',
            prefix: folderName,
        });

        return result.resources.map((file) => file.secure_url);
    } catch (error) {
        console.error('Error listing files:', error);
        return [];
    }
};

export const removeUploadedFile = async (publicId: string): Promise<void> => {
    try {
        await cloudinary.uploader.destroy(publicId);
        console.log(`File ${publicId} deleted successfully`);
    } catch (error) {
        console.error('Error deleting file:', error);
    }
};
