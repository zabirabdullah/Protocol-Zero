import mongoose from 'mongoose';

const { Schema } = mongoose;

// ─── Shared GPS sub-schema (GeoJSON Point) ────────────────────────────────────
const GeoPointSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: undefined,
    },
  },
  { _id: false }
);

// ─── Base Person Schema ────────────────────────────────────────────────────────
const PersonSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      default: null,
      lowercase: true,
      trim: true,
    },
    currentAddress: {
      type: String,
      trim: true,
    },
    homeAddress: {
      type: String,
      trim: true,
    },
    // Person's own reputation/rating score (manually assigned or updated)
    score: {
      type: Number,
      default: null,
    },
    // GeoJSON Point — nullable GPS location
    gps: {
      type: GeoPointSchema,
      default: null,
    },
    // postid of a Minor or Major Report where this person is a victim
    victimReportID: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    // discriminatorKey tells Mongoose which sub-type this document is
    discriminatorKey: 'kind',
    collection: 'persons',
  }
);

// 2dsphere index for geospatial queries on GPS location
PersonSchema.index({ gps: '2dsphere' }, { sparse: true });

const Person = mongoose.model('Person', PersonSchema);

export { GeoPointSchema };
export default Person;
