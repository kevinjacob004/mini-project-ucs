// const express = require("express");
// const router = express.Router();
// const authenticateToken = require("../middleware/authenticateToken");
// const { CounsellingReport, Counselling, User } = require("../models"); // Import models

// // 🔹 Fetch report details & student info
// router.get("/:session_id", authenticateToken, async (req, res) => {
//     try {
//         const sessionId = req.params.session_id;
        

//         // ✅ Get counselling session to fetch student_id
//         const counsellingSession = await Counselling.findOne({
//             where: { session_id: sessionId },
//             include: [{ model: User, as: "Student", attributes: ["first_name", "last_name","username"] }],
//         });

//         // const coun = await Counselling.findOne({
//         //     where: { session_id: sessionId },
//         //     include: [{ model: User, as: "Counsellor", attributes: ["first_name", "last_name","username"] }],
//         // });
//         if (!counsellingSession) {
//             return res.status(404).json({ error: "Counselling session not found" });
//         }

//         //const c_name=`${coun.first_name} ${coun.last_name}`;

//         const counsdate =`${counsellingSession.session_date_time}`;
//         const studentName = `${counsellingSession.Student.first_name} ${counsellingSession.Student.last_name}`;
//         const studentusername=`${counsellingSession.Student.username}`;
//         //console.log(studentusername);
//         // ✅ Get the report if it exists
//         const report = await CounsellingReport.findOne({
//             where: { counselling_id: sessionId },
//         });
//         //console.log(c_name);

//         if (!report) {
//             return res.status(404).json({
//                 error: "Report not found",
//                 student_name: studentName, // Send student name even if report doesn't exist
//                 user_name: studentusername,
//                 date_session:counsdate,
//                 //cname:c_name,
//             });
//         }

//         res.json({
//             student_name: studentName,
//             student_age: report.age,
//             department: report.department,
//             date_of_assessment: report.date_of_assessment,
//             referred_by: report.referred_by,
//             background_information: report.background_information,
//             collected_from: report.collected_from,
//             reason_for_referral: report.reason_for_referral,
//             previous_counseling_attendance: report.previous_counseling_attendance,
//             presenting_complaints: report.presenting_complaints,
//             observations_findings: report.observations_findings,
//             recommendations: report.recommendations,
//             follow_up: report.follow_up,
//         });

//     } catch (error) {
//         console.error("Error fetching report:", error);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// });

// // 🔹 Add a New Report
// router.post("/add-report", authenticateToken, async (req, res) => {
//     try {
//         const {
//             counselling_id,
//             student_age,
//             department,
//             date_of_assessment,
//             referred_by,
//             background_information,
//             collected_from,
//             reason_for_referral,
//             previous_counseling_attendance,
//             presenting_complaints,
//             observations_findings,
//             recommendations,
//             follow_up,
//         } = req.body;

//         if (!counselling_id || !student_age || !department || !date_of_assessment) {
//             return res.status(400).json({ error: "Required fields are missing" });
//         }

//         // ✅ Get student name from counselling session
//         const counsellingSession = await Counselling.findOne({
//             where: { session_id: counselling_id },
//             include: [{ model: User, as: "Student", attributes: ["first_name", "last_name"] }]
//         });

//         if (!counsellingSession) {
//             return res.status(404).json({ error: "Counselling session not found" });
//         }

//         const studentName = `${counsellingSession.Student.first_name} ${counsellingSession.Student.last_name}`;
//         const studentId = counsellingSession.student_id;
//         console.log(studentId);
//         // ✅ Create new report
//         const newReport = await CounsellingReport.create({
//             counselling_id,
//             student_id:studentId,
//             name: studentName,
//             age: student_age,
//             department,
//             date_of_assessment,
//             referred_by,
//             background_information,
//             collected_from,
//             reason_for_referral,
//             previous_counseling_attendance,
//             presenting_complaints,
//             observations_findings,
//             recommendations,
//             follow_up,
//         });

//         res.status(201).json({ message: "Report added successfully!", newReport });

//     } catch (error) {
//         //console.error("Error adding report:", error);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// });

// module.exports = router;


const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken");
const { CounsellingReport, Counselling, User } = require("../models"); // Import models

// 🔹 Fetch report details & student info
router.get("/:session_id", authenticateToken, async (req, res) => {
    try {
        const sessionId = req.params.session_id;

        // ✅ Get counselling session to fetch student_id
        const counsellingSession = await Counselling.findOne({
            where: { session_id: sessionId },
            include: [{ model: User, as: "Student", attributes: ["first_name", "last_name", "username"] }],
        });

        if (!counsellingSession) {
            return res.status(404).json({ error: "Counselling session not found" });
        }

        const counsdate = `${counsellingSession.session_date_time}`;
        const studentName = `${counsellingSession.Student.first_name} ${counsellingSession.Student.last_name}`;
        const studentusername = `${counsellingSession.Student.username}`;

        // ✅ Get the report if it exists
        const report = await CounsellingReport.findOne({ where: { counselling_id: sessionId } });

        if (!report) {
            return res.status(404).json({
                error: "Report not found",
                student_name: studentName,
                user_name: studentusername,
                date_session: counsdate,
            });
        }

        // ✅ Emit real-time event when report is fetched
        req.app.get("io").emit("reportFetched", { session_id: sessionId, student_name: studentName });

        res.json({
            student_name: studentName,
            student_age: report.age,
            department: report.department,
            date_of_assessment: report.date_of_assessment,
            referred_by: report.referred_by,
            background_information: report.background_information,
            collected_from: report.collected_from,
            reason_for_referral: report.reason_for_referral,
            previous_counseling_attendance: report.previous_counseling_attendance,
            presenting_complaints: report.presenting_complaints,
            observations_findings: report.observations_findings,
            recommendations: report.recommendations,
            follow_up: report.follow_up,
        });

    } catch (error) {
        console.error("Error fetching report:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 🔹 Add a New Report
router.post("/add-report", authenticateToken, async (req, res) => {
    try {
        const {
            counselling_id,
            student_age,
            department,
            date_of_assessment,
            referred_by,
            background_information,
            collected_from,
            reason_for_referral,
            previous_counseling_attendance,
            presenting_complaints,
            observations_findings,
            recommendations,
            follow_up,
        } = req.body;

        if (!counselling_id || !student_age || !department || !date_of_assessment) {
            return res.status(400).json({ error: "Required fields are missing" });
        }

        // ✅ Get student name from counselling session
        const counsellingSession = await Counselling.findOne({
            where: { session_id: counselling_id },
            include: [{ model: User, as: "Student", attributes: ["first_name", "last_name"] }],
        });

        if (!counsellingSession) {
            return res.status(404).json({ error: "Counselling session not found" });
        }

        const studentName = `${counsellingSession.Student.first_name} ${counsellingSession.Student.last_name}`;
        const studentId = counsellingSession.student_id;
        //const user_id=req.user.id;
        // ✅ Create new report
        const newReport = await CounsellingReport.create({
            counselling_id,
            student_id: studentId,
            name: studentName,
            age: student_age,
            department,
            date_of_assessment,
            referred_by,
            background_information,
            collected_from,
            reason_for_referral,
            previous_counseling_attendance,
            presenting_complaints,
            observations_findings,
            recommendations,
            follow_up,

        });

        // ✅ Emit real-time event when a new report is created
        req.app.get("io").emit("newReport", { session_id: counselling_id, student_name: studentName });
        console.log(newReport);
        res.status(201).json({ message: "Report added successfully!", newReport });

    } catch (error) {
        console.error("Error adding report:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
