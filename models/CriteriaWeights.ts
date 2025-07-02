import mongoose, { Schema, Document } from 'mongoose';

export interface ICriteriaWeights extends Document {
  experience: number;
  skills: number;
  certifications: number;
  behavioral: number;
  leadership: number;
}

const CriteriaWeightsSchema: Schema = new Schema({
  experience: { type: Number, required: true },
  skills: { type: Number, required: true },
  certifications: { type: Number, required: true },
  behavioral: { type: Number, required: true },
  leadership: { type: Number, required: true },
});

export default CriteriaWeightsSchema;
