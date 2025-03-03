const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const CounsellingReport = sequelize.define("CounsellingReport", {
  report_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  counselling_id: { 
    type: DataTypes.BIGINT, 
    allowNull: false,
    references: { model: "counselling", key: "session_id" }
  },
  student_name: { type: DataTypes.STRING, allowNull: false },
  student_age: { type: DataTypes.INTEGER, allowNull: false },
  problem_details: { type: DataTypes.TEXT, allowNull: false },
  solution: { type: DataTypes.TEXT, allowNull: false }
}, { 
  tableName: "counselling_reports", 
  timestamps: false 
});

module.exports = CounsellingReport;
