const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Thread = sequelize.define("Thread", {
  thread_id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

// Define associations
Thread.associate = (models) => {
  Thread.belongsTo(models.User, { foreignKey: "user_id" });
  Thread.hasMany(models.Message, { foreignKey: "thread_id" });
};

module.exports = Thread;