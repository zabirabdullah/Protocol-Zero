import mongoose from 'mongoose';
import Person from './Person.model.js';

// Volunteer has no extra fields beyond the base Person schema.
const Volunteer = Person.discriminator('Volunteer', new mongoose.Schema({}, { _id: false }));

export default Volunteer;
