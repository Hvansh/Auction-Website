const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        description: { type: String, required: true },
        startingBid: { type: Number, required: true },
        currentBid: { type: Number, required: true },
        imageUrl: { type: String, required: false }, // Changed to not required
        endTime: { type: Date, required: true },
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
       
        winner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        isActive: { type: Boolean, default: true },
    },
    {
        timestamps: true,
    }
);

const Auction = mongoose.model('Auction', auctionSchema);

module.exports = Auction;
