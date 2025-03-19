// const { DataTypes } = require("sequelize");
// const sequelize = require("../config/db");
// const User = require("./User"); // Import the User model

// const Notification = sequelize.define("Notification", {
//     notification_id: {
//         type: DataTypes.BIGINT,
//         autoIncrement: true,
//         primaryKey: true
//     },
//     user_id: {
//         type: DataTypes.BIGINT,
//         allowNull: false,
//         references: {
//             model: User,   // Reference to Users table
//             key: "id"
//         },
//         onUpdate: "CASCADE",
//         onDelete: "CASCADE"
//     },
//     message: {
//         type: DataTypes.TEXT,
//         allowNull: false
//     },
//     status: {
//         type: DataTypes.ENUM("unread", "read", "archived"),
//         allowNull: false,
//         defaultValue: "unread"
//     },
//     created_at: {
//         type: DataTypes.DATE,
//         defaultValue: DataTypes.NOW
//     },
//     updated_at: {
//         type: DataTypes.DATE,
//         defaultValue: DataTypes.NOW
//     }
// }, {
//     tableName: "Notification",
//     timestamps: true,
//     createdAt: "created_at",
//     updatedAt: "updated_at"
// });

// // Define the association
// Notification.associate = (models) => {
//     Notification.belongsTo(models.User, { foreignKey: "user_id", as: "user" });
// };

// // Sync model with database
// sequelize.sync()
//   .then(() => console.log("Notification table created"))
//   .catch(err => console.error("Error creating Notification table:", err));

// module.exports = Notification;


const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./User"); // Import the User model


const Notification = sequelize.define('Notification', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    userId: {type: DataTypes.BIGINT,
                allowNull: false,
                references: {
                    model: User,   // Reference to Users table
                    key: "id"
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE" },
    title: { type: DataTypes.STRING, allowNull: false },
    body: { type: DataTypes.TEXT, allowNull: false },
    isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
    
});



module.exports = Notification;