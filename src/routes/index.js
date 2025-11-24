const express = require('express');
const teacherController = require('../controllers/teacherController');

const router = express.Router();

router.post('/register', teacherController.registerStudents);
router.get('/commonstudents', teacherController.getCommonStudents);
router.post('/suspend', teacherController.suspendStudent);
router.post('/retrievefornotifications', teacherController.retrieveForNotifications);

module.exports = router;
