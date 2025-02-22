const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("batrp3ge5owruyhj8v0f", "umsrqiltlexnl3lb", "GC2vTJIQ58DYav3fNTPC", {
    host: "batrp3ge5owruyhj8v0f-mysql.services.clever-cloud.com",
    dialect: "mysql",
    logging: false, // Set to true for debugging SQL queries
});

// Test connection
sequelize.authenticate()
    .then(() => console.log("Database connected successfully!"))
    .catch((err) => console.error("Database connection error:", err));

module.exports = sequelize;
