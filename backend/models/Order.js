// models/MenuItem.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");


// models/Order.js
const Order = sequelize.define('Order', {
    order_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.BIGINT, allowNull: false, references: { model: 'Users', key: 'id' } },
    order_status: { type: DataTypes.ENUM('ordering','placed', 'ready','cancelled','delivered'), defaultValue: 'placed' },
    total_price: { type: DataTypes.FLOAT, allowNull: false },
    reservation_time: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
}, { timestamps: true });

// Define associations
Order.associate = (models) => {
    Order.hasMany(models.OrderItems, { foreignKey: 'order_id' });
    Order.belongsTo(models.User, { foreignKey: 'user_id' });

};



module.exports = Order;