import mongoose, { Schema, Document } from 'mongoose';

export interface ICompetency extends Document {
  id: string;
  name: string;
  weight: 1 | 2 | 3 | 4 | 5;
}

const CompetencySchema: Schema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  weight: { type: Number, required: true, enum: [1, 2, 3, 4, 5] },
});

export default CompetencySchema;
