// models/MenuItem.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");


const MenuItem = sequelize.define('MenuItem', {
    menu_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    item_name: { type: DataTypes.STRING, allowNull: false },
    item_description: { type: DataTypes.TEXT },
    price: { type: DataTypes.FLOAT, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    available_from: { type: DataTypes.TIME, allowNull: false },
    available_to: { type: DataTypes.TIME, allowNull: false },
}, { timestamps: true });

// Define associations
MenuItem.associate = (models) => {
    MenuItem.hasMany(models.OrderItems, { foreignKey: 'item_id' });
};

module.exports = MenuItem;