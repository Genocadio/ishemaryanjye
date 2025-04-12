import mongoose, { Schema, Document } from "mongoose"

export interface IGameStats extends Document {
  userId: string
  opponentName: string
  gameLevel: string
  userScore: number
  opponentScore: number
  overallGameScore: number
  wonByQuestion: boolean
  createdAt: Date
}

const GameStatsSchema = new Schema<IGameStats>({
  userId: {
    type: String,
    required: true,
  },
  opponentName: {
    type: String,
    required: true,
  },
  gameLevel: {
    type: String,
    required: true,
  },
  userScore: {
    type: Number,
    required: true,
  },
  opponentScore: {
    type: Number,
    required: true,
  },
  overallGameScore: {
    type: Number,
    required: true,
  },
  wonByQuestion: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.models.GameStats || mongoose.model<IGameStats>("GameStats", GameStatsSchema) 