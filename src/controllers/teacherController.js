const { Teacher, Student, TeacherStudent } = require('../models');

async function registerStudents(req, res, next) {
  try {
    const { teacher, students } = req.body || {};
    if (!teacher || !Array.isArray(students) || students.length === 0) {
      const err = new Error('Invalid payload');
      err.status = 400;
      throw err;
    }

    const [teacherRecord] = await Teacher.findOrCreate({ where: { email: teacher } });

    const studentRecords = await Promise.all(
      students.map((email) =>
        Student.findOrCreate({ where: { email } }).then(([student]) => student)
      )
    );

    await teacherRecord.addStudents(studentRecords);

    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}

async function getCommonStudents(req, res, next) {
  try {
    let { teacher } = req.query;
    if (!teacher) {
      const err = new Error('teacher query parameter is required');
      err.status = 400;
      throw err;
    }

    const teachers = Array.isArray(teacher) ? teacher : [teacher];

    const teacherRecords = await Teacher.findAll({ where: { email: teachers } });
    if (teacherRecords.length !== teachers.length) {
      const err = new Error('One or more teachers not found');
      err.status = 400;
      throw err;
    }

    const teacherIds = teacherRecords.map((t) => t.id);

    const associations = await TeacherStudent.findAll({ where: { TeacherId: teacherIds } });

    const counts = new Map();
    associations.forEach((a) => {
      const key = a.StudentId;
      counts.set(key, (counts.get(key) || 0) + 1);
    });

    const commonStudentIds = Array.from(counts.entries())
      .filter(([, count]) => count === teacherIds.length)
      .map(([studentId]) => studentId);

    const students = await Student.findAll({ where: { id: commonStudentIds }, attributes: ['email'] });

    return res.status(200).json({ students: students.map((s) => s.email) });
  } catch (err) {
    return next(err);
  }
}

async function suspendStudent(req, res, next) {
  try {
    const { student } = req.body || {};
    if (!student) {
      const err = new Error('student is required');
      err.status = 400;
      throw err;
    }

    const studentRecord = await Student.findOne({ where: { email: student } });
    if (!studentRecord) {
      const err = new Error('Student not found');
      err.status = 404;
      throw err;
    }

    studentRecord.suspended = true;
    await studentRecord.save();

    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}

function extractMentionedEmails(text) {
  if (!text) return [];
  const regex = /@([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
  const emails = new Set();
  let match;
  while ((match = regex.exec(text)) !== null) {
    emails.add(match[1]);
  }
  return Array.from(emails);
}

async function retrieveForNotifications(req, res, next) {
  try {
    const { teacher, notification } = req.body || {};
    if (!teacher || !notification) {
      const err = new Error('teacher and notification are required');
      err.status = 400;
      throw err;
    }

    const teacherRecord = await Teacher.findOne({ where: { email: teacher } });
    if (!teacherRecord) {
      const err = new Error('Teacher not found');
      err.status = 404;
      throw err;
    }

    const mentionedEmails = extractMentionedEmails(notification);

    const registeredStudents = await teacherRecord.getStudents({ where: { suspended: false } });

    const allCandidateEmails = new Set([
      ...registeredStudents.map((s) => s.email),
      ...mentionedEmails,
    ]);

    const candidates = await Student.findAll({
      where: {
        email: Array.from(allCandidateEmails),
        suspended: false,
      },
      attributes: ['email'],
    });

    return res.status(200).json({ recipients: candidates.map((s) => s.email) });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  registerStudents,
  getCommonStudents,
  suspendStudent,
  retrieveForNotifications,
};
