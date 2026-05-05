import mongoose from 'mongoose';
import { GeoPointSchema } from './Person.model.js';

const { Schema } = mongoose;

// ─── Vote sub-schema ──────────────────────────────────────────────────────────
const VoteSchema = new Schema(
  {
    upvote: { type: Number, default: 0 },
    downvote: { type: Number, default: 0 },
    upvoterIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Person', // any actor in the persons collection
      },
    ],
    downvoterIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Person',
      },
    ],
  },
  { _id: false }
);

// ─── Comment sub-schema ───────────────────────────────────────────────────────
const CommentSchema = new Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },
    commenterId: {
      type: Schema.Types.ObjectId,
      ref: 'Person',
      required: true,
    },
  },
  { timestamps: true, _id: true }
);

// ─── Minor Report Schema ──────────────────────────────────────────────────────
const MinorReportSchema = new Schema(
  {
    postid: {
      type: String,
      required: [true, 'Post ID is required'],
      unique: true,
      trim: true,
    },
    issuerId: {
      type: Schema.Types.ObjectId,
      ref: 'Person',
      required: [true, 'Issuer ID is required'],
    },
    updaterId: {
      type: Schema.Types.ObjectId,
      ref: 'Person',
      default: null,
    },
    // Single GeoJSON Point for the incident location
    location: {
      type: GeoPointSchema,
      required: [true, 'Location is required'],
    },
    time: {
      type: Date,
      required: [true, 'Time is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    // Array of image URLs — null/empty if no images
    image: {
      type: [String],
      default: null,
    },
    // IDs of persons who are victims in this report
    victims: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Person',
      },
    ],
    vote: {
      type: VoteSchema,
      default: () => ({ upvote: 0, downvote: 0, upvoterIds: [], downvoterIds: [] }),
    },
    reliability: {
      type: String,
      enum: {
        values: ['none', 'valid', 'false'],
        message: 'Reliability must be one of: none, valid, false',
      },
      default: 'none',
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'closed'],
        message: 'Status must be one of: active, closed',
      },
      default: 'active',
    },
    comments: {
      type: [CommentSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Virtual: score = upvote - downvote ───────────────────────────────────────
MinorReportSchema.virtual('score').get(function () {
  return (this.vote?.upvote ?? 0) - (this.vote?.downvote ?? 0);
});

// ─── Indexes ──────────────────────────────────────────────────────────────────
MinorReportSchema.index({ location: '2dsphere' });
MinorReportSchema.index({ status: 1 });
MinorReportSchema.index({ category: 1 });
MinorReportSchema.index({ time: -1 });

const MinorReport = mongoose.model('MinorReport', MinorReportSchema);

export { VoteSchema, CommentSchema };
export default MinorReport;
