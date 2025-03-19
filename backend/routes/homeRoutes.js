const express = require("express");
const router = express.Router();
const { User } = require("../models");
const authenticateToken = require("../middleware/auth");


router.get('/total-students', async (req, res) => {
    try {
        const totalStudents = await User.count();
        // console.log("Total students:", totalStudents);
        res.json({ total_students: totalStudents });
        
    } catch (error) {
      console.error('Error fetching total students:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // ✅ Get all users (Admin only)
router.get("/all-users", authenticateToken, async (req, res) => {
  try {

      // Ensure only admin can access
      if (req.headers.role !== "admin") {
          return res.status(403).json({ error: "Access denied" });
      }

      const users = await User.findAll({ attributes: ["id", "first_name", "last_name", "email", "role"] });
      res.json({ users });
  } catch (error) {
      console.error("Error fetching all users:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});


// Update user profile
router.put("/update-profile", authenticateToken, async (req, res) => {
    try {
        const { id } = req.user; // Assuming you have user ID from the authentication middleware
        const { fname, lname, email } = req.body;

        // Validate input
        if (!fname || !lname || !email) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // Find the user by ID
        const user = await User.findOne({ where: { id } });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Update user details
        user.first_name = fname;
        user.last_name = lname;
        user.email = email;
        await user.save();

        // Return success response
        res.status(200).json({ message: "Profile updated successfully", user });
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ error: "An error occurred while updating the profile" });
    }
});

module.exports = router;

  module.exports = router;