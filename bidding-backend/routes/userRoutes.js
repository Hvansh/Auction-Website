const express = require('express');
const router = express.Router();
const {
    registerUser,
    authUser,
} = require('../controllers/userController');

// URL: /api/users/
router.post('/', registerUser);

// URL: /api/users/login
router.post('/login', authUser);

module.exports = router;