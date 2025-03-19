const express = require("express");
const router = express.Router();
const { Thread, Message, User, Notification } = require("../models");
const authenticateToken = require("../middleware/auth");

// ✅ Function to safely get `io`
function getIo(req) {
    const io = req.app.get("io");
    if (!io) {
        console.error("Socket.io instance not found!");
        return null;
    }
    return io;
}

// ✅ 1️⃣ Create a New Thread (Post)
router.post("/threads", authenticateToken, async (req, res) => {
    try {
        const { title, content } = req.body;
        if (!title || !content) return res.status(400).json({ error: "Title and content are required" });

        const user_id = req.user.id;
        const newThread = await Thread.create({ user_id, title, content });

        // Emit event for real-time update
        const io = getIo(req);
        if (io) {
            io.emit("newPost", {
                ...newThread.toJSON(),
                User: { first_name: req.user.first_name, last_name: req.user.last_name },
            });
        }

        res.status(201).json(newThread);
    } catch (error) {
        console.error("Error creating thread:", error);
        res.status(500).json({ error: "An error occurred while creating the thread" });
    }
});

// ✅ 2️⃣ Get All Threads
router.get("/threads", async (req, res) => {
    try {
        const threads = await Thread.findAll({
            include: [
                {
                    model: User,
                    attributes: ["id", "first_name", "last_name", "username"],
                },
            ],
            order: [["created_at", "DESC"]],
        });
        res.status(200).json(threads);
    } catch (error) {
        console.error("Error fetching threads:", error);
        res.status(500).json({ error: "An error occurred while fetching threads" });
    }
});

// ✅ 3️⃣ Get a Single Thread with Comments
router.get("/threads/:thread_id", async (req, res) => {
    try {
        const { thread_id } = req.params;
        const thread = await Thread.findOne({
            where: { thread_id },
            include: [
                { model: User, attributes: ["first_name", "last_name"] },
                {
                    model: Message,
                    include: [{ model: User, attributes: ["first_name", "last_name"] }],
                },
            ],
        });

        if (!thread) return res.status(404).json({ error: "Thread not found" });

        res.status(200).json(thread);
    } catch (error) {
        console.error("Error fetching thread:", error);
        res.status(500).json({ error: "An error occurred while fetching the thread" });
    }
});

// //✅ 4️⃣ Create a New Comment (Message)
// router.post("/messages", authenticateToken, async (req, res) => {
//     try {
//         const { thread_id, message_content } = req.body;
//         if (!thread_id || !message_content) return res.status(400).json({ error: "Thread ID and message content are required" });

//         const user_id = req.user.id;
//         const newMessage = await Message.create({ thread_id, user_id, message_content });

//         // Emit event for real-time update
//         const io = getIo(req);
//         if (io) {
//             io.emit("newComment", {
//                 ...newMessage.toJSON(),
//                 User: { first_name: req.user.first_name, last_name: req.user.last_name },
//             });
//         }

//         res.status(201).json(newMessage);
//     } catch (error) {
//         console.error("Error creating message:", error);
//         res.status(500).json({ error: "An error occurred while creating the message" });
//     }
// });

// ✅ 4️⃣ Create a New Comment (Message)
router.post("/messages", authenticateToken, async (req, res) => {
    try {
        const { thread_id, message_content, name } = req.body;
        if (!thread_id || !message_content) {
            return res.status(400).json({ error: "Thread ID and message content are required" });
        }

        const user_id = req.user.id;
        const newMessage = await Message.create({ thread_id, user_id, message_content });

        // 🔹 Fetch the thread to get the original post owner
        const thread = await Thread.findByPk(thread_id);
        if (!thread) {
            return res.status(404).json({ error: "Thread not found" });
        }

        const postOwner = await User.findByPk(thread.user_id); // Get the user who created the thread
        if (!postOwner) {
            return res.status(404).json({ error: "Post owner not found" });
        }
        console.log(postOwner);
        console.log(postOwner.first_name);

        // 🔹 Save Notification in the Database
        const notification = await Notification.create({
            userId: postOwner.id, // The owner of the post should receive the notification
            title: "New Comment on Your Post",
            body: `${name} commented: "${message_content}"`,
            isRead: false,
        });

        if (user_id !== postOwner.id) {
            // 🔹 Emit Event for Real-Time Notification (Push Notification)
            const io = getIo(req); // Get the Socket.IO instance
            if (io) {
                io.to(`user_${postOwner.id}`).emit("newNotification", {
                    notification_id: notification.id,
                    title: notification.title,
                    body: notification.body,
                    isRead: notification.isRead,
                    commenterName: name,
                });
            }

            // 🔹 Emit Event for Real-Time Comment Update
            io.emit("newComment", {
                ...newMessage.toJSON(),
                User: { first_name: req.user.first_name, last_name: req.user.last_name },
            });

        }

        res.status(201).json(newMessage);
    } catch (error) {
        console.error("Error creating message:", error);
        res.status(500).json({ error: "An error occurred while creating the message" });
    }
});


// ✅ 5️⃣ Get All Comments for a Thread
router.get("/threads/:thread_id/messages", async (req, res) => {
    try {
        const { thread_id } = req.params;
        const messages = await Message.findAll({
            where: { thread_id },
            include: [
                {
                    model: User,
                    attributes: ["id", "first_name", "last_name", "username"],
                },
            ],
            order: [["created_at", "ASC"]],
        });

        if (!messages.length) return res.status(404).json({ error: "No messages found for this thread" });

        res.status(200).json(messages);
    } catch (error) {
        console.error("Error fetching thread messages:", error);
        res.status(500).json({ error: "An error occurred while fetching thread messages" });
    }
});

// ✅ 6️⃣ Delete a Thread
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

        // Delete all associated comments first
        await Message.destroy({ where: { thread_id } });

        // Delete the thread
        await thread.destroy();

        // Emit event for real-time update
        const io = getIo(req);
        if (io) io.emit("deletePost", thread_id);

        res.json({ message: "Thread and all comments deleted successfully" });
    } catch (error) {
        console.error("Error deleting thread:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ✅ 7️⃣ Delete a Comment (Message)
router.delete("/messages/:message_id", authenticateToken, async (req, res) => {
    try {
        const { message_id } = req.params;
        const user_id = req.user.id;
        const user_role = req.headers.role;

        const message = await Message.findOne({ where: { message_id } });
        if (!message) return res.status(404).json({ error: "Message not found" });

        // Allow deletion if the user is the author OR an admin
        if (message.user_id !== user_id && user_role !== "admin") {
            return res.status(403).json({ error: "Unauthorized" });
        }

        // Delete the message
        await message.destroy();

        // Emit event for real-time update
        const io = getIo(req);
        if (io) io.emit("deleteComment", message_id);

        res.json({ message: "Comment deleted successfully" });
    } catch (error) {
        console.error("Error deleting message:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
