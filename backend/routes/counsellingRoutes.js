const express = require("express");
const router = express.Router();
const { Counselling, User } = require("../models");
const authenticateToken = require("../middleware/authenticateToken"); 


// 🔹 Fetch available counsellors
router.get("/available-counsellors", async (req, res) => {
    try {
      const counsellors = await User.findAll({
        where: { role: "counselor" },
        attributes: ["id", "first_name", "last_name"],
      });
  
      console.log("Counsellors Fetched:", counsellors); // Debugging log
  
      if (counsellors.length === 0) {
        return res.status(404).json({ error: "No counsellors available" });
      }
  
      res.json(counsellors);
    } catch (error) {
      console.error("Error fetching counsellors:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

// // 🔹 Book a slot with selected counsellor
// router.post("/book-slot", async (req, res) => {
//   try {
//     const { student_id, counsellor_id, session_date_time } = req.body;

//     const formattedDateTime = new Date(session_date_time)
//       .toISOString()
//       .slice(0, 19)
//       .replace("T", " ");

//     // Check if the student has already booked a session at this time
//     const studentBookedSession = await Counselling.findOne({
//       where: { student_id, session_date_time: formattedDateTime },
//     });

//     if (studentBookedSession) {
//       return res
//         .status(400)
//         .json({ error: "You have already booked a session for this time." });
//     }

//     // Check if the slot is already taken for this counsellor
//     const existingSlot = await Counselling.findOne({
//       where: { counsellor_id, session_date_time: formattedDateTime },
//     });

//     if (existingSlot) {
//       return res.status(400).json({ error: "This counsellor is unavailable at this time" });
//     }

//     // Create the booking
//     const booking = await Counselling.create({
//       student_id,
//       counsellor_id,
//       session_date_time: formattedDateTime,
//     });

//     res.json({ message: "Session booked successfully!", booking });

//   } catch (error) {
//     console.error("Error booking slot:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

router.post("/book-slot", async (req, res) => {
    try {
      const { student_id, counsellor_id, session_date_time } = req.body;
      const formattedDateTime = new Date(session_date_time).toISOString().slice(0, 19).replace("T", " ");
  
      if (!counsellor_id) return res.status(400).json({ error: "No counsellor selected" });
  
      const existingSlot = await Counselling.findOne({
        where: { counsellor_id, session_date_time: formattedDateTime },
      });
  
      if (existingSlot) return res.status(400).json({ error: "This counsellor is unavailable at this time" });
  
      const booking = await Counselling.create({ student_id, counsellor_id, session_date_time: formattedDateTime });
      res.json({ message: "Session booked successfully!", booking });
  
    } catch (error) {
      console.error("Error booking slot:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  

// // 🔹 Fetch booked slots
// router.get("/booked-slots", async (req, res) => {
//   try {
//     const slots = await Counselling.findAll({
//       include: [
//         { model: User, as: "Student", attributes: ["id", "first_name", "last_name", "email"] },
//         { model: User, as: "Counsellor", attributes: ["id", "first_name", "last_name"] },
//       ],
//       order: [["session_date_time", "ASC"]],
//     });

//     res.json(slots);
//   } catch (error) {
//     console.error("Error fetching booked slots:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });



// // 🔹 Fetch booked slots for the logged-in counsellor
// router.get("/booked-slots", async (req, res) => {
//     try {
//       // Assuming the logged-in counsellor's ID is stored in `req.user.id`
//       const counsellorId = req.id;  
  
//       if (!counsellorId) {
//         return res.status(401).json({ error: "Unauthorized: Counsellor not logged in" });
//       }
  
//       const slots = await Counselling.findAll({
//         where: { counselor_id: counsellorId },  // 🔹 Fetch slots for this counsellor only
//         include: [
//           { model: User, as: "Student", attributes: ["id", "first_name", "last_name", "email"] },
//         ],
//         order: [["session_date_time", "ASC"]],
//       });
  
//       res.json(slots);
//     } catch (error) {
//       console.error("Error fetching booked slots:", error);
//       res.status(500).json({ error: "Internal Server Error" });
//     }
//   });
  
// // 🔹 Fetch booked slots for the logged-in counsellor
router.get("/booked-slots", authenticateToken, async (req, res) => {
    try {
        // 🔹 Extract the logged-in counselor's ID from req.user (set by middleware)
        const counsellorId = req.user.id;  

        if (!counsellorId) {
            return res.status(401).json({ error: "Unauthorized: Counsellor not logged in" });
        }

        // 🔹 Fetch only sessions booked with this specific counsellor
        const slots = await Counselling.findAll({
            where: { counsellor_id: counsellorId },  // Fetch only sessions for the logged-in counsellor
            include: [
                { model: User, as: "Student", attributes: ["id", "first_name", "last_name", "email"] },
            ],
            order: [["session_date_time", "ASC"]],
        });

        res.json(slots);
    } catch (error) {
        console.error("Error fetching booked slots:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});



router.post("/book-slot", async (req, res) => {
    try {
        const { student_id, counsellor_id, session_date_time } = req.body;

        if (!student_id || !counsellor_id || !session_date_time) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // ✅ Check if this student has already booked this time slot
        const existingBooking = await Counselling.findOne({
            where: { student_id, session_date_time }
        });

        if (existingBooking) {
            return res.status(400).json({ error: "You have already booked this slot" });
        }

        // ✅ Check if the counsellor is available at this time
        const counsellorUnavailable = await Counselling.findOne({
            where: { counsellor_id, session_date_time }
        });

        if (counsellorUnavailable) {
            return res.status(400).json({ error: "This counsellor is unavailable at this time" });
        }

        // ✅ Store the booking directly without conversion
        const booking = await Counselling.create({
            student_id,
            counsellor_id,
            session_date_time
        });

        res.json({ message: "Session booked successfully!", booking });

    } catch (error) {
        console.error("Error booking slot:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});




// 🔹 Fetch booked slots for the logged-in student
router.get("/student-booked-slots", authenticateToken, async (req, res) => {
    try {
        const studentId = req.user.id; // 🔹 Get logged-in student's ID

        if (!studentId) {
            return res.status(401).json({ error: "Unauthorized: Student not logged in" });
        }

        // 🔹 Fetch only sessions booked by this specific student
        const slots = await Counselling.findAll({
            where: { student_id: studentId }, // ✅ Fetch only the logged-in student's bookings
            include: [
                { model: User, as: "Counsellor", attributes: ["id", "first_name", "last_name"] },
            ],
            order: [["session_date_time", "ASC"]],
        });

        res.json(slots);
    } catch (error) {
        console.error("Error fetching student booked slots:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});



router.put("/add-feedback/:session_id", async (req, res) => {
    try {
        const { session_id } = req.params;
        const { feedback } = req.body;

        if (!feedback.trim()) return res.status(400).json({ error: "Feedback cannot be empty" });

        const slot = await Counselling.findByPk(session_id);
        if (!slot) return res.status(404).json({ error: "Slot not found" });

        slot.feedback = feedback;
        await slot.save();

        res.json({ message: "Feedback added successfully!", slot });
    } catch (error) {
        console.error("Error adding feedback:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});





module.exports = router;
