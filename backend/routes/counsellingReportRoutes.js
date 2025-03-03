const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken"); 
const { CounsellingReport } = require("../models");


// 🔹 Add a New Report
router.post("/add-report", authenticateToken, async (req, res) => {
    try {
        const { counselling_id, student_name, student_age, problem_details, solution } = req.body;

        if (!counselling_id || !student_name || !student_age || !problem_details || !solution) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const newReport = await CounsellingReport.create({ counselling_id, student_name, student_age, problem_details, solution });
        res.status(201).json({ message: "Report added successfully!", newReport });
    } catch (error) {
        console.error("Error adding report:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.get("/:session_id", authenticateToken, async (req, res) => {
    try {
        const sessionId = req.params.session_id;

        const report = await CounsellingReport.findOne({
            where: { counselling_id: sessionId },
        });

        if (!report) {
            return res.status(404).json({ error: "Report not found" });
        }

        res.json(report);
    } catch (error) {
        console.error("Error fetching report:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});



module.exports=router;