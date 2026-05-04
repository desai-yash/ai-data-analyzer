import fs from 'fs/promises';
import Dataset from '../models/Dataset.js';
import { getPreviewRows, parseDataFile } from '../services/dataParser.js';

export const uploadDataset = async (req, res, next) => {
  try {
    if (!req.file) {
      const error = new Error('No file uploaded');
      error.statusCode = 400;
      throw error;
    }

    const parsed = await parseDataFile(req.file);

    const datasetData = {
      fileName: req.file.filename,
      originalName: req.file.originalname,
      columns: parsed.columns,
      rowCount: parsed.rows.length,
      preview: getPreviewRows(parsed.rows),
      rawSummary: parsed.summary
    };

    const isAuthenticated = Boolean(req.user && req.user._id);
    let dataset = null;

    if (isAuthenticated) {
      datasetData.userId = req.user._id;
      dataset = await Dataset.create(datasetData);
    }

    await fs.unlink(req.file.path).catch(() => {});

    res.status(201).json(isAuthenticated ? dataset : { ...datasetData, persisted: false });
  } catch (error) {
    if (req.file?.path) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    next(error);
  }
};

export const getDataset = async (req, res, next) => {
  try {
    const dataset = await Dataset.findById(req.params.id);

    if (!dataset || (dataset.userId && (!req.user || dataset.userId.toString() !== req.user._id.toString()))) {
      const error = new Error('Dataset not found');
      error.statusCode = 404;
      throw error;
    }

    res.json(dataset);
  } catch (error) {
    next(error);
  }
};
