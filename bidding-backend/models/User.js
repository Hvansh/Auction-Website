const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    // UPDATED FIELD: Set to an optional String. We remove the default 
    // to prevent issues when saving large Base64 strings.
    profilePicture: { 
        type: String,
        // We will manage the default avatar on the frontend now (in script.js)
        // Leaving it optional allows the controller to conditionally pass data.
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields automatically
});

// Middleware to hash password before saving a new user
userSchema.pre('save', async function(next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare entered password with the hashed password in the database
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
