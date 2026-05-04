import Analysis from '../models/Analysis.js';

export const getHistory = async (req, res, next) => {
  try {
    const analyses = await Analysis.find({ userId: req.user._id })
      .populate('datasetId', 'fileName originalName columns rowCount createdAt')
      .sort({ createdAt: -1 });

    res.json(analyses);
  } catch (error) {
    next(error);
  }
};

export const getAnalysis = async (req, res, next) => {
  try {
    const analysis = await Analysis.findOne({ _id: req.params.id, userId: req.user._id }).populate('datasetId');

    if (!analysis) {
      const error = new Error('Analysis not found');
      error.statusCode = 404;
      throw error;
    }

    res.json(analysis);
  } catch (error) {
    next(error);
  }
};

export const deleteAnalysis = async (req, res, next) => {
  try {
    const analysis = await Analysis.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

    if (!analysis) {
      const error = new Error('Analysis not found');
      error.statusCode = 404;
      throw error;
    }

    res.json({ message: 'Analysis deleted' });
  } catch (error) {
    next(error);
  }
};
