const sequelize = require("../config/db");

// Import models
const User = require("./User");
const Thread = require("./Thread");
const Message = require("./Message");
const Counselling = require("./Counselling");
const CounsellingReport = require("./CounsellingReport");

// Register associations
User.associate({ Thread, Message, Counselling });
Thread.associate({ User, Message });
Message.associate({ User, Thread });
Counselling.associate({User});
//CounsellingReport.associate({Counselling});

// Export models
module.exports = {
  sequelize,
  User,
  Thread,
  Message,
  Counselling,
  CounsellingReport,
};