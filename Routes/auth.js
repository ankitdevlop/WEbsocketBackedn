const jwt = require('jsonwebtoken');
const User = require('../model/user'); 

// Signup function
async function signup(req, res) {
    const { email, userName, password } = req.body;
    try {
        const newUser = new User({ email, userName, password });
        await newUser.save();
        const token = jwt.sign({ id: newUser._id }, 'your_jwt_secret', { expiresIn: '1h' });
        res.status(201).json({ token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

// Login function
async function login(req, res) {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: user._id }, 'your_jwt_secret', { expiresIn: '1h' });
        res.status(200).json({ token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

module.exports = { signup, login };
