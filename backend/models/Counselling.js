const { DataTypes } = require("sequelize");
const sequelize = require("../config/db"); // Import your Sequelize instance

const Counselling = sequelize.define('Counselling', {
  session_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  student_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    references: {
      model: 'Users', // References the Users table
      key: 'id', // References the user_id column in the Users table
    },
    onDelete: 'SET NULL',
  },
  counsellor_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    references: {
      model: 'Users', // References the Users table
      key: 'id', // References the user_id column in the Users table
    },
    onDelete: 'SET NULL',
  },
  session_date_time: {
    type: DataTypes.DATE,
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
  feedback:{
    type: DataTypes.TEXT,
    allowNull: true,
  }
}, {
  tableName: 'counselling', // Explicitly set the table name
  timestamps: false, 
});


 Counselling.associate = (models) => {
     Counselling.belongsTo(models.User, { foreignKey: 'student_id', as: 'Student' });
   Counselling.belongsTo(models.User, { foreignKey: 'counsellor_id', as: 'Counsellor' });
   };


module.exports = Counselling;