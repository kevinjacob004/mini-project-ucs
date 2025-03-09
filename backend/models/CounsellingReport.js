 const { DataTypes } = require("sequelize");
 const sequelize = require("../config/db");

// const CounsellingReport = sequelize.define("CounsellingReport", {
//   report_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
//   counselling_id: { 
//     type: DataTypes.BIGINT, 
//     allowNull: false,
//     references: { model: "counselling", key: "session_id" }
//   },
//   student_name: { type: DataTypes.STRING, allowNull: false },
//   student_age: { type: DataTypes.INTEGER, allowNull: false },
//   problem_details: { type: DataTypes.TEXT, allowNull: false },
//   solution: { type: DataTypes.TEXT, allowNull: false }
// }, { 
//   tableName: "counselling_reports", 
//   timestamps: false 
// });

// module.exports = CounsellingReport;
// Sequelize Model: counselling_reports.js

  const CounsellingReport = sequelize.define("CounsellingReport", {
      counselling_id: {
          type: DataTypes.BIGINT,
          primaryKey: true,
          allowNull: false,
          references: {
              model: "counselling",
              key: "session_id"
          }
      },
      student_id: {
          type: DataTypes.BIGINT,
          allowNull: false,
          references: {
              model: "Users",
              key: "id"
          }
      },
      name: {
          type: DataTypes.STRING,
          allowNull: false
      },
      age: {
          type: DataTypes.INTEGER,
          allowNull: false
      },
      department: {
          type: DataTypes.STRING,
          allowNull: false
      },
      date_of_assessment: {
          type: DataTypes.DATE,
          allowNull: false
      },
      referred_by: {
          type: DataTypes.STRING,
          allowNull: true
      },
      background_information: {
          type: DataTypes.TEXT,
          allowNull: true
      },
      collected_from: {
          type: DataTypes.STRING,
          allowNull: true
      },
      reason_for_referral: {
          type: DataTypes.TEXT,
          allowNull: true
      },
      previous_counseling_attendance: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false
      },
      presenting_complaints: {
          type: DataTypes.TEXT,
          allowNull: true
      },
      observations_findings: {
          type: DataTypes.TEXT,
          allowNull: true
      },
      recommendations: {
          type: DataTypes.TEXT,
          allowNull: true
      },
      follow_up: {
          type: DataTypes.TEXT,
          allowNull: true
      },
      counsellor_signature: {
          type: DataTypes.STRING,
          allowNull: true
      }
  }, {
    tableName: "counselling_reports", 
    timestamps: false 
  });
  

  CounsellingReport.associate = (models) => {
    CounsellingReport.belongsTo(models.User, { foreignKey: "student_id", as: "Student" });
    CounsellingReport.belongsTo(models.Counselling, { foreignKey: "counsellor_id", as: "Counsellor" });
  };

  module.exports = CounsellingReport;
