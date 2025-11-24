const sequelize = require('../config/database');
const Teacher = require('./Teacher');
const Student = require('./Student');
const TeacherStudent = require('./TeacherStudent');

Teacher.belongsToMany(Student, { through: TeacherStudent });
Student.belongsToMany(Teacher, { through: TeacherStudent });

module.exports = {
  sequelize,
  Teacher,
  Student,
  TeacherStudent,
};
