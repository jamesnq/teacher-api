const request = require('supertest');
require('dotenv').config({ path: '.env.test' });

const app = require('../src/app');
const { sequelize, Teacher, Student } = require('../src/models');

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

beforeEach(async () => {
  await Teacher.destroy({ where: {} });
  await Student.destroy({ where: {} });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Teacher API assessment', () => {
  test('POST /api/register registers students to teacher', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({
        teacher: 'teacherken@gmail.com',
        students: ['studentjon@gmail.com', 'studenthon@gmail.com'],
      });
    expect(res.status).toBe(204);
  });

  test('GET /api/commonstudents returns students for single teacher', async () => {
    await request(app)
      .post('/api/register')
      .send({
        teacher: 'teacherken@gmail.com',
        students: ['student1@gmail.com', 'student2@gmail.com'],
      });

    const res = await request(app).get('/api/commonstudents?teacher=teacherken%40gmail.com');
    expect(res.status).toBe(200);
    expect(res.body.students).toEqual(
      expect.arrayContaining(['student1@gmail.com', 'student2@gmail.com'])
    );
  });

  test('POST /api/suspend suspends a student', async () => {
    await request(app)
      .post('/api/register')
      .send({
        teacher: 'teacherken@gmail.com',
        students: ['studentmary@gmail.com'],
      });

    const res = await request(app)
      .post('/api/suspend')
      .send({ student: 'studentmary@gmail.com' });
    expect(res.status).toBe(204);
  });

  test('POST /api/retrievefornotifications returns recipients', async () => {
    await request(app)
      .post('/api/register')
      .send({
        teacher: 'teacherken@gmail.com',
        students: ['studentbob@gmail.com', 'studentagnes@gmail.com'],
      });

    await request(app)
      .post('/api/suspend')
      .send({ student: 'studentagnes@gmail.com' });

    const res = await request(app)
      .post('/api/retrievefornotifications')
      .send({
        teacher: 'teacherken@gmail.com',
        notification: 'Hello students! @studentagnes@gmail.com @studentmiche@gmail.com',
      });

    expect(res.status).toBe(200);
    expect(res.body.recipients).toEqual(
      expect.arrayContaining(['studentbob@gmail.com', 'studentmiche@gmail.com'])
    );
    expect(res.body.recipients).not.toContain('studentagnes@gmail.com');
  });
});
