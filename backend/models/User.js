const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const User = sequelize.define("Users", {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  timestamps: true,
});

// Define associations
User.associate = (models) => {
  User.hasMany(models.Thread, { foreignKey: "user_id" });
  User.hasMany(models.Message, { foreignKey: "user_id" });
};

// Sync model with database
sequelize.sync()
  .then(() => console.log("User table created"))
  .catch(err => console.error("Error creating User table:", err));

module.exports = User;