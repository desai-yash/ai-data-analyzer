import mongoose from 'mongoose';

const analysisSchema = new mongoose.Schema(
  {
    datasetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dataset',
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    },
    question: {
      type: String,
      required: true,
      trim: true
    },
    aiResponse: {
      type: String,
      required: true
    },
    insights: {
      type: [String],
      default: []
    },
    chartSuggestion: {
      type: {
        type: String,
        enum: ['bar', 'line', 'pie', 'scatter', ''],
        default: ''
      },
      xAxis: {
        type: String,
        default: ''
      },
      yAxis: {
        type: String,
        default: ''
      },
      reason: {
        type: String,
        default: ''
      }
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

export default mongoose.model('Analysis', analysisSchema);
