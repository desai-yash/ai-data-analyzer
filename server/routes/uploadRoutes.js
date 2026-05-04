import express from 'express';
import multer from 'multer';
import { getDataset, uploadDataset } from '../controllers/uploadController.js';

const router = express.Router();
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
const maxFileSizeMb = Number(process.env.MAX_FILE_SIZE_MB || 10);

const upload = multer({
  dest: uploadDir,
  limits: { fileSize: maxFileSizeMb * 1024 * 1024 }
});

router.post('/', upload.single('file'), uploadDataset);
router.get('/:id', getDataset);

export default router;
