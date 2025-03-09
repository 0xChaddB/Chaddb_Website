import mongoose from 'mongoose';

const nftSchema = new mongoose.Schema({
  owner: { type: String, required: true },
  metadataURI: { type: String, required: true },
  colors: {
    color1: String,
    color2: String,
    color3: String,
  },
  taskId: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model('NFT', nftSchema);