import mongoose from 'mongoose';

const blackListTokensSchema = new mongoose.Schema({
    tokenId: { type: String, unique: true, required: true },
    expiryDate: { type: String, required: true },
}, { timestamps: true });

const BlackListTokens = mongoose.model.BlackListTokens || mongoose.model('BlackListTokens', blackListTokensSchema);

export default BlackListTokens;