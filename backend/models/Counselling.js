const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Counselling = sequelize.define("Counselling", {
  session_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  student_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    references: { model: "Users", key: "id" },
    onDelete: "SET NULL",
  },
  counsellor_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    references: { model: "Users", key: "id" },
    onDelete: "SET NULL",
  },
  session_date_time: { type: DataTypes.DATE, allowNull: false },
  remark: { type: DataTypes.TEXT, allowNull: true }, // ✅ Counsellor's remark
  feedback: { type: DataTypes.TEXT, allowNull: true }, // ✅ Student's feedback
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: "counselling", timestamps: false });

Counselling.associate = (models) => {
  Counselling.belongsTo(models.User, { foreignKey: "student_id", as: "Student" });
  Counselling.belongsTo(models.User, { foreignKey: "counsellor_id", as: "Counsellor" });
};

module.exports = Counselling;
