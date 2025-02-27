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


  module.exports = router;