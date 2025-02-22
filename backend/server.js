const express = require("express");
const dotenv = require("dotenv");
const sequelize = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const cors = require("cors");
const communityRoutes = require("./routes/communityRoutes");



dotenv.config();
const app = express();




// Enable CORS with specific options
const corsOptions = {
    origin: "*", // Allow all origins (replace with your frontend URL in production)
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // Allow all HTTP methods
    preflightContinue: false,
    optionsSuccessStatus: 204, // Respond with 204 No Content for preflight requests
};


app.use(cors(corsOptions));

// Enable CORS for all routes

// Handle preflight requests
app.options("*", cors(corsOptions)); // Allow preflight requests for all routes


app.use(express.json()); // Middleware for parsing JSON


app.use("/api/auth", authRoutes); // Mount auth routes
app.use("/api/community", communityRoutes); // Community routes


//Start server after DB connection
sequelize.authenticate()
    .then(() => {
        console.log("Connected to MySQL");
        app.listen(5000, () => console.log("Server running on port 5000"));
    })
    .catch(err => console.error("Database connection error:", err));

app.get('/',(req,res)=>{
    res.send("Running");
});
// app.listen(3000,()=>{
//     console.log("Succcess\n");
// });