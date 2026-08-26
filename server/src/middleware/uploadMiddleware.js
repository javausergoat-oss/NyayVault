import multer from 'multer';

const MAX_SIZE = parseInt(process.env.MAX_FILE_SIZE_BYTES || '52428800', 10);

// Use in-memory buffer storage to immediately compute SHA-256 hash before disk/s3 write
const storage = multer.memoryStorage();

export const uploadSingleEvidence = multer({
  storage,
  limits: {
    fileSize: MAX_SIZE,
    files: 1,
  },
}).single('file');

export default {
  uploadSingleEvidence,
};
