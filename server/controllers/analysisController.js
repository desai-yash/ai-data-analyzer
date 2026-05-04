import Dataset from '../models/Dataset.js';
import Analysis from '../models/Analysis.js';
import * as aiService from '../services/aiService.js';

const findDataset = async (datasetId, userId) => {
  const dataset = await Dataset.findById(datasetId);

  if (!dataset) {
    const error = new Error('Dataset not found');
    error.statusCode = 404;
    throw error;
  }

  if (dataset.userId && (!userId || dataset.userId.toString() !== userId.toString())) {
    const error = new Error('Dataset not found');
    error.statusCode = 404;
    throw error;
  }

  return dataset;
};

export const createInsights = async (req, res, next) => {
  try {
    const { datasetId, rawSummary } = req.body;

    if (!datasetId && !rawSummary) {
      const error = new Error('datasetId or rawSummary is required');
      error.statusCode = 400;
      throw error;
    }

    const dataset = datasetId ? await findDataset(datasetId, req.user?._id) : null;
    const summary = rawSummary || dataset.rawSummary;
    const result = await aiService.generateInsights(summary);
    const aiResponse = [
      ...result.insights,
      ...result.anomalies.map((item) => `Anomaly: ${item}`),
      ...result.recommendations.map((item) => `Recommendation: ${item}`)
    ].join('\n');

    const responsePayload = {
      insights: result.insights,
      anomalies: result.anomalies,
      recommendations: result.recommendations,
      chartSuggestion: result.chartSuggestion,
      aiResponse: aiResponse || 'No insights were generated.'
    };

    if (req.user?._id && datasetId) {
      const analysis = await Analysis.create({
        datasetId,
        userId: req.user._id,
        question: 'Generate dataset insights',
        aiResponse: responsePayload.aiResponse,
        insights: result.insights,
        chartSuggestion: result.chartSuggestion
      });
      responsePayload.analysis = analysis;
    }

    res.status(201).json(responsePayload);
  } catch (error) {
    next(error);
  }
};

export const chatWithDataset = async (req, res, next) => {
  try {
    const { datasetId, rawSummary, question } = req.body;

    if ((!datasetId && !rawSummary) || !question) {
      const error = new Error('datasetId or rawSummary and question are required');
      error.statusCode = 400;
      throw error;
    }

    const dataset = datasetId ? await findDataset(datasetId, req.user?._id) : null;
    const summary = rawSummary || dataset.rawSummary;
    const answer = await aiService.askQuestion(summary, question);

    let analysis;
    if (req.user?._id && datasetId) {
      analysis = await Analysis.create({
        datasetId,
        userId: req.user._id,
        question,
        aiResponse: answer,
        insights: [],
        chartSuggestion: {
          type: '',
          xAxis: '',
          yAxis: '',
          reason: ''
        }
      });
    }

    res.status(201).json({ answer, analysis });
  } catch (error) {
    next(error);
  }
};
