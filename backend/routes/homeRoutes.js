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


  module.exports = router;