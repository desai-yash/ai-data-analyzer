import mongoose from 'mongoose';

const datasetSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true,
      trim: true
    },
    originalName: {
      type: String,
      required: true,
      trim: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    },
    columns: {
      type: [
        {
          name: {
            type: String,
            required: true,
            trim: true
          },
          type: {
            type: String,
            enum: ['number', 'string', 'date', 'boolean', 'empty'],
            default: 'string'
          }
        }
      ],
      default: []
    },
    rowCount: {
      type: Number,
      default: 0
    },
    preview: {
      type: [mongoose.Schema.Types.Mixed],
      default: []
    },
    rawSummary: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

export default mongoose.model('Dataset', datasetSchema);
