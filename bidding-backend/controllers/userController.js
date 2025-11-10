const User = require('../models/User');
const generateToken = require('../utils/generateToken');

/**
 * @desc    Register a new user
 * @route   POST /api/users
 * @access  Public
 */
const registerUser = async (req, res, next) => {
    // UPDATED: Destructure the new profilePicture field
    const { name, email, password, profilePicture } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            // FIX: Explicitly setting the status and returning a JSON response
            return res.status(400).json({ message: 'User already exists' });
        }
        
        // Prepare data object
        const userData = {
            name,
            email,
            password,
        };
        
        // Only include the profilePicture field if a file/data was provided.
        if (profilePicture) {
            userData.profilePicture = profilePicture;
        }

        const user = await User.create(userData);

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                // UPDATED: Include the profilePicture data in the response
                profilePicture: user.profilePicture, 
                token: generateToken(user._id),
            });
        } else {
            // FIX: Explicitly setting the status and returning a JSON response
            return res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        // Ensuring we send a response even in catch blocks with proper JSON formatting
        const statusCode = res.statusCode === 200 ? 500 : res.statusCode; // Use 500 if status wasn't set earlier
        res.status(statusCode).json({ message: error.message || 'Server error during registration.' });
    }
};

/**
 * @desc    Auth user & get token (Login)
 * @route   POST /api/users/login
 * @access  Public
 */
const authUser = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                // UPDATED: Include the profilePicture URL/Base64 in the login response
                profilePicture: user.profilePicture, 
                token: generateToken(user._id),
            });
        } else {
            // FIX: Explicitly setting the status and returning a JSON response
            return res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        // Ensuring we send a response even in catch blocks
        const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
        res.status(statusCode).json({ message: error.message || 'Server error during login.' });
    }
};

module.exports = {
    registerUser,
    authUser,
};