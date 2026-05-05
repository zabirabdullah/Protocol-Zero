import mongoose from 'mongoose';
import Person from './Person.model.js';

const { Schema } = mongoose;

// ResponseTeam adds NID, face, office details, and a role enum.
const ResponseTeamSchema = new Schema(
  {
    nid: {
      type: String,
      required: [true, 'National ID (NID) is required for response team members'],
      trim: true,
    },
    face: {
      type: String, // URL to the member's face/profile image
      default: null,
    },
    officeName: {
      type: String,
      trim: true,
    },
    officeAddress: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: {
        values: ['police', 'firefighter', 'civilsurgeon'],
        message: 'Role must be one of: police, firefighter, civilsurgeon',
      },
      required: [true, 'Role is required for response team members'],
    },
  },
  { _id: false }
);

const ResponseTeam = Person.discriminator('ResponseTeam', ResponseTeamSchema);

export default ResponseTeam;
