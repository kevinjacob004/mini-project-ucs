const sequelize = require("../config/db");

// Import models
const User = require("./User");
const Thread = require("./Thread");
const Message = require("./Message");

// Register associations
User.associate({ Thread, Message });
Thread.associate({ User, Message });
Message.associate({ User, Thread });

// Export models
module.exports = {
  sequelize,
  User,
  Thread,
  Message,
};