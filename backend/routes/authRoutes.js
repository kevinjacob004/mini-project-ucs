const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User} = require("../models");
const authenticateToken = require("../middleware/auth");

//const { Thread, Message, User } = require("../models");


const router = express.Router();
const SECRET_KEY = "my_super_secret_key_12345"; // Change this in production

// User Registration Route
router.post("/register", async (req, res) => {
    try {
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

        // Create new user
        const newUser = await User.create({
            first_name,
            last_name,
            email,
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
        if (!isPasswordValid) {
            return res.status(400).json({ error: "Invalid username or password" });
        }

        // Generate a JWT token
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || "my_super_secret_key_12345", {
            expiresIn: "1h", // Token expires in 1 hour
        });

        // Send the token in the response
        //res.status(200).json({ message: "Login successful", token });
        
        //Send the token and user information in the response
        res.status(200).json({
            message: "Login successful",
            token,
            username: user.username,
            first_name: user.first_name,
            last_name: user.last_name,
            id: user.id,
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "An error occurred during login" });
    }
});


// // Create a new post (thread)
// router.post("/threads", authenticateToken, async (req, res) => {
//     try {
//       const { title, content } = req.body;
//       const user_id = req.user.id; // Get the logged-in user's ID from the token
  
//       const newThread = await Thread.create({ user_id, title, content });
//       res.status(201).json(newThread);
//     } catch (error) {
//       console.error("Error creating thread:", error);
//       res.status(500).json({ error: "An error occurred while creating the thread" });
//     }
//   });
  
//   // Get all posts (threads)
//   router.get("/threads", async (req, res) => {
//     try {
//       const threads = await Thread.findAll({
//         include: [{ model: User, attributes: ["first_name", "last_name"] }], // Include the user who created the thread
//         order: [["created_at", "DESC"]], // Sort by latest first
//       });
//       res.status(200).json(threads);
//     } catch (error) {
//       console.error("Error fetching threads:", error);
//       res.status(500).json({ error: "An error occurred while fetching threads" });
//     }
//   });
  
//   // Create a new comment (message)
//   router.post("/messages", authenticateToken, async (req, res) => {
//     try {
//       const { thread_id, message_content } = req.body;
//       const user_id = req.user.id; // Get the logged-in user's ID from the token
  
//       const newMessage = await Message.create({ thread_id, user_id, message_content });
//       res.status(201).json(newMessage);
//     } catch (error) {
//       console.error("Error creating message:", error);
//       res.status(500).json({ error: "An error occurred while creating the message" });
//     }
//   });
  
//   // Get comments (messages) for a thread
//   router.get("/threads/:thread_id/messages", async (req, res) => {
//     try {
//       const { thread_id } = req.params;
//       const messages = await Message.findAll({
//         where: { thread_id },
//         include: [{ model: User, attributes: ["first_name", "last_name"] }], // Include the user who created the message
//         order: [["created_at", "ASC"]], // Sort by oldest first
//       });
//       res.status(200).json(messages);
//     } catch (error) {
//       console.error("Error fetching messages:", error);
//       res.status(500).json({ error: "An error occurred while fetching messages" });
//     }
//   });
  


module.exports = router;
