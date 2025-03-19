
const sequelize = require("../config/db");

// Import models
const User = require("./User");
const Thread = require("./Thread");
const Message = require("./Message");
const Counselling = require("./Counselling");
const CounsellingReport = require("./CounsellingReport");
const MenuItem = require("./Menu");
const Order = require("./Order");
const OrderItems = require("./OrderItems");
const Notification=require("./Notification");

// Register associations
User.associate({ Thread, Message, Counselling,Order,CounsellingReport,});
Thread.associate({ User, Message });
Message.associate({ User, Thread });
Counselling.associate({User,CounsellingReport});
CounsellingReport.associate({Counselling,User});
// Define associations for MenuItem, Order, and OrderItems
MenuItem.associate({ OrderItems });
Order.associate({ OrderItems,User });
OrderItems.associate({ Order, MenuItem });
//Notification.associate({User});
//UserFCMToken.associate({User});

// Export models
module.exports = {
  sequelize,
  User,
  Thread,
  Message,
  Counselling,
  CounsellingReport,
  MenuItem,
  Order,
  OrderItems,
  Notification,
  
};