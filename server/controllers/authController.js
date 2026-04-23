const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// POST /api/auth/register
const register = async (req, res) => {
  const { name, email, password, country, phone } = req.body;

  // Basic validation
  if (!name || !email || !password || !country || !phone) {
    return res.status(400).json({ message: "All fields are required." });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters." });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const user = await User.create({ name, email, password, country, phone });
    const token = generateToken(user._id);

    res.status(201).json({
      message: "Account created successfully.",
      token,
      user,
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Registration failed. Please try again." });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = generateToken(user._id);

    // Remove password from response
    const userObj = user.toJSON();

    res.json({
      message: "Login successful.",
      token,
      user: userObj,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login failed. Please try again." });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  // req.user is attached by verifyToken middleware
  res.json({ user: req.user });
};

module.exports = { register, login, getMe };
