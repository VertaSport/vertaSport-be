import { deleteObject, getDownloadURL, getStorage, listAll, ref, uploadBytesResumable } from 'firebase/storage';
import { getCurrentDateTime } from './datetime';
import { addAbortSignal } from 'stream';

export const uploadFiles = async (files: Express.Multer.File[], folder?: string) => {
    const dateTime = getCurrentDateTime();
    const storage = getStorage();
    const fileUrls: string[] = [];
    const fileUrlRefs: string[] = [];
    const originNames: string[] = [];

    for (let i = 0; i < files.length; i++) {
        const storageRef = ref(storage, `files/${files[i].originalname}/${dateTime}`);
        const urlRef = `files/${files[i]?.originalname}/${dateTime}`;
        fileUrlRefs.push(urlRef);
        originNames.push(files[i].originalname);
        // Create file metadata including the content type
        const metadata = {
            contentType: files[i]?.mimetype,
        };
        // Upload the file in the bucket storage
        const snapshot = await uploadBytesResumable(storageRef, files[i]?.buffer, metadata);
        //by using uploadBytesResumable we can control the progress of uploading like pause, resume, cancel
        const downloadURL = await getDownloadURL(snapshot.ref);
        fileUrls.push(downloadURL);
    }

    return { fileUrls, fileUrlRefs, originNames };
};

export const uploadSingleFile = async (file: any, folder?: string) => {
    const dateTime = getCurrentDateTime();
    const storage = getStorage();

    const storageRef = ref(storage, `${folder}/${file.originalname}/${dateTime}`);
    const urlRef = `${folder}/${file.originalname}/${dateTime}`;
    const metadata = {
        contentType: file.mimetype,
    };
    // Upload the file in the bucket storage
    const snapshot = await uploadBytesResumable(storageRef, file?.buffer, metadata);
    //by using uploadBytesResumable we can control the progress of uploading like pause, resume, cancel
    const downloadURL = await getDownloadURL(snapshot.ref);

    return { downloadURL, urlRef };
};

export const getListAllFilesStorage = async (folderName: string) => {
    const storage = getStorage();
    const storageRef = ref(storage, folderName);
    try {
        const res = await listAll(storageRef);
        const urls = await Promise.all(res.items.map((itemRef) => getDownloadURL(itemRef)));
        return urls;
    } catch (error) {
        console.error('Error listing files:', error);
    }
};

export const removeUploadedFile = async (urlRef?: string) => {
    const storage = getStorage();

    // Create a reference to the file to delete
    const desertRef = ref(storage, urlRef);

    deleteObject(desertRef)
        .then(() => {
            // File deleted successfully
            console.log(`File deleted successfully`);
        })
        .catch((error) => {
            console.log(error);
        });
};
