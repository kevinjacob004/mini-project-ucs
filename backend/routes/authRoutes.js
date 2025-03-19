const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const authenticateToken = require("../middleware/auth");
const router = express.Router();
const SECRET_KEY = "my_super_secret_key_12345";

const nodemailer = require("nodemailer");
const crypto = require("crypto");

// Temporary storage for OTPs
const otpStorage = new Map();

// 🔹 Configure email transporter (Replace with your SMTP details)
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "kevin.jacob@rnpodarschool.com", // 🔹 Replace with your email
        pass: "ptsp slgu ykgn daqq" // 🔹 Generate App Password in Google Security
    },
});

// 🔹 Step 1: Check username & email and send OTP
router.post("/forgot-password", async (req, res) => {
    try {
        const { email, username } = req.body;

        // ✅ Check if user exists
        const user = await User.findOne({ where: { email, username } });
        if (!user) {
            return res.status(404).json({ error: "No account found with this email and username" });
        }

        // ✅ Generate OTP
        const otp = crypto.randomInt(100000, 999999).toString();
        otpStorage.set(email, otp); // Store OTP temporarily

        // ✅ Send OTP via email
        await transporter.sendMail({
            from: '"UCS Support" kevin.jacob@rnpodarschool.com',
            to: email,
            subject: "Password Reset Verification Code",
            text: `Your verification code is: ${otp}`,
        });

        res.json({ message: "Verification code sent to your email!" });
    } catch (error) {
        console.error("Error in forgot password:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 🔹 Step 2: Verify OTP
router.post("/verify-otp", async (req, res) => {
    try {
        const { email, otp } = req.body;

        // ✅ Check if OTP matches
        if (otpStorage.get(email) !== otp) {
            return res.status(400).json({ error: "Invalid OTP or OTP expired" });
        }

        // ✅ OTP is correct → Allow password reset
        otpStorage.delete(email); // Remove OTP after use
        res.json({ message: "OTP verified successfully!" });
    } catch (error) {
        console.error("Error in verifying OTP:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 🔹 Step 3: Reset Password
router.post("/reset-password", async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        // ✅ Find the user
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        // ✅ Hash the new password (if hashing is used in your project)
        user.password = hashedPassword; // Ideally, hash before saving
        await user.save();
        

        res.json({ message: "Password reset successful!" });
    } catch (error) {
        console.error("Error in resetting password:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});




// User Registration Route
router.post("/register", async (req, res) => {
    try {
        let role;
        const { first_name, last_name, email, username, password } = req.body;
        // Check if required fields are present
        if (!first_name || !last_name || !email || !username || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Assign role based on username prefix
        if (username.startsWith('FIT')) {
            role = 'student';
        } else if (username.startsWith('CON')) {
            role = 'counselor';
        } else if (username.startsWith('CANSTAFF')) {
            role = 'canteen_staff';
         } 
        //else if (username.startsWith('ADMIN')) {
        //     role = 'admin';
        // }
        else {
            return res.status(400).json({ error: "Invalid username prefix. Username must start with 'FIT', 'CON', or 'CANSTAFF'." });
        }
        // Create new user
        const newUser = await User.create({
            first_name,
            last_name,
            email,
            role,
            username,
            password: hashedPassword,
        });

        res.status(201).json({ message: "User registered successfully", user: newUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});


// User Login Route
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if required fields are present
        if (!username || !password) {
            return res.status(400).json({ error: "Username and password are required" });
        }

        // Find the user by username
        const user = await User.findOne({ where: { username } });
        if (!user) {
            return res.status(400).json({ error: "Invalid username or password" });
        }
        // Compare the provided password with the hashed password in the database
        const isPasswordValid = await bcrypt.compare(password, user.password);
        //console.log(isPasswordValid);
        if (!isPasswordValid) {
            return res.status(400).json({ error: "Invalid username or password" });
        }

        // Generate a JWT token
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || "my_super_secret_key_12345", {
            expiresIn: "1h", // Token expires in 1 hour
        });

        // Send the token in the response
        //Send the token and user information in the response
        res.status(200).json({
            message: "Login successful",
            token,
            username: user.username,
            first_name: user.first_name,
            last_name: user.last_name,
            id: user.id,
            role: user.role,
            email: user.email,
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "An error occurred during login" });
    }
});



module.exports = router;
