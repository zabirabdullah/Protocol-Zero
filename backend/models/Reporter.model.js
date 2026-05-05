import mongoose from 'mongoose';
import Person from './Person.model.js';

const { Schema } = mongoose;

// Reporter adds NID and face (profile image URL) on top of the base Person schema.
const ReporterSchema = new Schema(
  {
    nid: {
      type: String,
      required: [true, 'National ID (NID) is required for reporters'],
      trim: true,
    },
    face: {
      type: String, // URL to the reporter's face/profile image
      default: null,
    },
  },
  { _id: false }
);

const Reporter = Person.discriminator('Reporter', ReporterSchema);

export default Reporter;
