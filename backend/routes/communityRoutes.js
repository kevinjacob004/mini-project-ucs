const express = require("express");
const router = express.Router();
const { Thread, Message, User } = require("../models");
const authenticateToken = require("../middleware/auth");



// Create a new post (thread)
router.post("/threads", authenticateToken, async (req, res) => {
  try {
    const { title, content } = req.body;

    // Validate input
    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }

    const user_id = req.user.id; // Get the logged-in user's ID from the token

    const newThread = await Thread.create({ user_id, title, content });
    res.status(201).json(newThread);
  } catch (error) {
    console.error("Error creating thread:", error);
    res.status(500).json({ error: "An error occurred while creating the thread" });
  }
});

// Get all posts (threads)
router.get("/threads", async (req, res) => {
  try {
    const threads = await Thread.findAll({
      include: [
        { 
          model: User, 
          attributes: ["id", "first_name", "last_name", "username"], // Include user details
        },
      ],
      order: [["created_at", "DESC"]], // Sort by latest first
    });
    res.status(200).json(threads);
  } catch (error) {
    console.error("Error fetching threads:", error);
    res.status(500).json({ error: "An error occurred while fetching threads" });
  }
});

// Create a new comment (message)
router.post("/messages", authenticateToken, async (req, res) => {
  try {
    const { thread_id, message_content } = req.body;

    // Validate input
    if (!thread_id || !message_content) {
      return res.status(400).json({ error: "Thread ID and message content are required" });
    }

    const user_id = req.user.id; // Get the logged-in user's ID from the token

    const newMessage = await Message.create({ thread_id, user_id, message_content });
    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error creating message:", error);
    res.status(500).json({ error: "An error occurred while creating the message" });
  }
});

// Get all messages (comments)
router.get("/messages", async (req, res) => {
  try {
    const messages = await Message.findAll({
      include: [
        { 
          model: User, 
          attributes: ["id", "first_name", "last_name", "username"], // Include user details
        },
        { 
          model: Thread, 
          attributes: ["title"], // Include the thread the message belongs to
        },
      ],
      order: [["created_at", "DESC"]], // Sort by latest first
    });
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "An error occurred while fetching messages" });
  }
});

// Get messages for a specific thread
router.get("/threads/:thread_id/messages", async (req, res) => {
  try {
    const { thread_id } = req.params;

    const messages = await Message.findAll({
      where: { thread_id }, // Filter by thread ID
      include: [
        { 
          model: User, 
          attributes: ["id", "first_name", "last_name", "username"], // Include user details
        },
      ],
      order: [["created_at", "ASC"]], // Sort by oldest first (for chronological order)
    });

    if (!messages.length) {
      return res.status(404).json({ error: "No messages found for this thread" });
    }

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching thread messages:", error);
    res.status(500).json({ error: "An error occurred while fetching thread messages" });
  }
});



// routes/communityRoutes.js
router.get("/threads/:thread_id/comments", async (req, res) => {
    try {
      const { thread_id } = req.params;
  
      const comments = await Message.findAll({
        where: { thread_id },
        include: [{ model: User, attributes: ["first_name", "last_name"] }],
        order: [["created_at", "ASC"]],
      });
  
      res.status(200).json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ error: "An error occurred while fetching comments" });
    }
  });


//   // routes/communityRoutes.js
// router.get("/threads/:thread_id", async (req, res) => {
//     try {
//       const { thread_id } = req.params;
  
//       const thread = await Thread.findOne({
//         where: { thread_id },
//         include: [
//           { model: User, attributes: ["first_name", "last_name"] }, // Include the user who created the thread
//           { 
//             model: Message, // Include all messages (comments) for the thread
//             include: [{ model: User, attributes: ["first_name", "last_name"] }], // Include the user who created each comment
//           },
//         ],
//       });
  
//       if (!thread) {
//         return res.status(404).json({ error: "Thread not found" });
//       }
  
//       res.status(200).json(thread);
//     } catch (error) {
//       console.error("Error fetching thread:", error);
//       res.status(500).json({ error: "An error occurred while fetching the thread" });
//     }
//   });

// router.delete("/api/community/threads/:thread_id", async (req, res) => {
//   const { thread_id } = req.params;
//   const token = req.headers.authorization?.split(" ")[1];

//   try {
//     // Verify the user is authenticated
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const userId = decoded.userId;

//     // Find the thread
//     const thread = await Thread.findOne({ where: { thread_id } });
//     if (!thread) {
//       return res.status(404).json({ error: "Thread not found" });
//     }

//     // Check if the user is the owner of the thread
//     if (thread.user_id !== userId) {
//       return res.status(403).json({ error: "You are not authorized to delete this thread" });
//     }

//     // Delete the thread
//     await thread.destroy();
//     res.json({ message: "Thread deleted successfully" });
//   } catch (error) {
//     console.error("Error deleting thread:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });


// router.delete("/api/community/messages/:message_id", async (req, res) => {
//   const { message_id } = req.params;
//   const token = req.headers.authorization?.split(" ")[1];

//   try {
//     // Verify the user is authenticated
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const userId = decoded.userId;

//     // Find the message
//     const message = await Message.findOne({ where: { message_id } });
//     if (!message) {
//       return res.status(404).json({ error: "Message not found" });
//     }

//     // Check if the user is the owner of the message
//     if (message.user_id !== userId) {
//       return res.status(403).json({ error: "You are not authorized to delete this message" });
//     }

//     // Delete the message
//     await message.destroy();
//     res.json({ message: "Message deleted successfully" });
//   } catch (error) {
//     console.error("Error deleting message:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });



// router.delete("/threads/:thread_id", authenticateToken, async (req, res) => {
//   try {
//       const { thread_id } = req.params;
//       const user_id = req.user.id;
//       const user = req.user; // Assuming user details are attached to the request

//       const thread = await Thread.findOne({ where: { thread_id } });
//       if (!thread) return res.status(404).json({ error: "Thread not found" });

//       if (thread.user_id !== user_id) return res.status(403).json({ error: "Unauthorized" });

//       // 🔹 Delete all associated comments first
//       await Message.destroy({ where: { thread_id } });

//       // 🔹 Delete the thread
//       await thread.destroy();

//       res.json({ message: "Thread and all comments deleted successfully" });

//   } catch (error) {
//       console.error("Error deleting thread:", error);
//       res.status(500).json({ error: "Internal Server Error" });
//   }
// });



// router.delete("/messages/:message_id", authenticateToken, async (req, res) => {
//   try {
//       const { message_id } = req.params;
//       const user_id = req.user.id;

//       const message = await Message.findOne({ where: { message_id } });
//       if (!message) return res.status(404).json({ error: "Message not found" });

//       if (message.user_id !== user_id) return res.status(403).json({ error: "Unauthorized" });

//       // 🔹 Delete the message
//       await message.destroy();

//       res.json({ message: "Comment deleted successfully" });

//   } catch (error) {
//       console.error("Error deleting message:", error);
//       res.status(500).json({ error: "Internal Server Error" });
//   }
// });

router.delete("/threads/:thread_id", authenticateToken, async (req, res) => {
  try {
    const { thread_id } = req.params;
    const user_id = req.user.id;
    const user_role = req.headers.role;

    const thread = await Thread.findOne({ where: { thread_id } });
    if (!thread) return res.status(404).json({ error: "Thread not found" });

    // Allow deletion if the user is the author OR an admin
    if (thread.user_id !== user_id && user_role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // 🔹 Delete all associated comments first
    await Message.destroy({ where: { thread_id } });

    // 🔹 Delete the thread
    await thread.destroy();

    res.json({ message: "Thread and all comments deleted successfully" });

  } catch (error) {
    consol.log(error);
    console.error("Error deleting thread:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


router.delete("/messages/:message_id", authenticateToken, async (req, res) => {
  try {
    const { message_id } = req.params;
    const user_id = req.user.id;
    const user=req.user;
    const user_role = req.headers.role;    
    console.log(user_role);
    console.log("Decoded User:", user);

    const message = await Message.findOne({ where: { message_id } });
    if (!message) return res.status(404).json({ error: "Message not found" });

    // Allow deletion if the user is the author OR an admin
    if (message.user_id !== user_id && user_role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // 🔹 Delete the message
    await message.destroy();

    res.json({ message: "Comment deleted successfully" });

  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


module.exports = router;