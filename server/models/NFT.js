import mongoose from 'mongoose';

const nftSchema = new mongoose.Schema({
    owner: { type: String, required: true },
    metadataURI: { type: String, required: true },
    colors: {
        color1: { type: String },
        color2: { type: String },
        color3: { type: String }
    },
    taskId: { type: String, unique: true },
    mintedAt: { type: Date, default: Date.now } 
});

const NFT = mongoose.model('NFT', nftSchema);
export default NFT;
