import mongoose from 'mongoose';
import Person from './Person.model.js';

// User has no extra fields beyond the base Person schema.
const User = Person.discriminator('User', new mongoose.Schema({}, { _id: false }));

export default User;
