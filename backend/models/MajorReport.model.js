import mongoose from 'mongoose';
import { GeoPointSchema } from './Person.model.js';
import { VoteSchema, CommentSchema } from './MinorReport.model.js';

const { Schema } = mongoose;

// ─── Location entry sub-schema ────────────────────────────────────────────────
// Each Major Report has multiple locations, each with a GeoJSON coordinate + radius.
const MajorLocationSchema = new Schema(
  {
    coordinate: {
      type: GeoPointSchema,
      required: [true, 'Coordinate is required for each location entry'],
    },
    // Radius of the affected area (in kilometres)
    radius: {
      type: Number,
      required: [true, 'Radius (km) is required for each location entry'],
      min: [0, 'Radius must be a non-negative number'],
    },
  },
  { _id: false }
);

// ─── Major Report Schema ──────────────────────────────────────────────────────
const MajorReportSchema = new Schema(
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
    // Array of location+radius pairs (multiple affected zones)
    locations: {
      type: [MajorLocationSchema],
      required: [true, 'At least one location is required'],
      validate: {
        validator: (arr) => arr && arr.length > 0,
        message: 'locations must contain at least one entry',
      },
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
MajorReportSchema.virtual('score').get(function () {
  return (this.vote?.upvote ?? 0) - (this.vote?.downvote ?? 0);
});

// ─── Indexes ──────────────────────────────────────────────────────────────────
// 2dsphere on nested coordinate field inside the locations array
MajorReportSchema.index({ 'locations.coordinate': '2dsphere' });
MajorReportSchema.index({ postid: 1 }, { unique: true });
MajorReportSchema.index({ status: 1 });
MajorReportSchema.index({ category: 1 });
MajorReportSchema.index({ time: -1 });

const MajorReport = mongoose.model('MajorReport', MajorReportSchema);

export default MajorReport;
