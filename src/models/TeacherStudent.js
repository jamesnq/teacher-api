const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TeacherStudent = sequelize.define('TeacherStudent', {
  TeacherId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  StudentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = TeacherStudent;
