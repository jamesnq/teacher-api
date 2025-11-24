const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Teacher API Assessment',
    version: '1.0.0',
    description: 'API for teacher/student administrative functions',
  },
  servers: [
    {
      url: 'http://localhost:3000',
    },
  ],
  paths: {
    '/api/register': {
      post: {
        summary: 'Register one or more students to a teacher',
        tags: ['Teachers'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  teacher: { type: 'string', format: 'email' },
                  students: {
                    type: 'array',
                    items: { type: 'string', format: 'email' },
                  },
                },
                required: ['teacher', 'students'],
              },
            },
          },
        },
        responses: {
          204: { description: 'Students registered successfully' },
          400: { description: 'Invalid payload' },
        },
      },
    },
    '/api/commonstudents': {
      get: {
        summary: 'Get common students for one or more teachers',
        tags: ['Teachers'],
        parameters: [
          {
            name: 'teacher',
            in: 'query',
            description: 'Teacher email (may appear multiple times)',
            required: true,
            schema: { type: 'string', format: 'email' },
          },
        ],
        responses: {
          200: {
            description: 'List of common students',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    students: {
                      type: 'array',
                      items: { type: 'string', format: 'email' },
                    },
                  },
                },
              },
            },
          },
          400: { description: 'Missing or invalid teacher query parameter(s)' },
        },
      },
    },
    '/api/suspend': {
      post: {
        summary: 'Suspend a student',
        tags: ['Students'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  student: { type: 'string', format: 'email' },
                },
                required: ['student'],
              },
            },
          },
        },
        responses: {
          204: { description: 'Student suspended' },
          400: { description: 'Missing student' },
          404: { description: 'Student not found' },
        },
      },
    },
    '/api/retrievefornotifications': {
      post: {
        summary: 'Get list of students who should receive a notification',
        tags: ['Notifications'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  teacher: { type: 'string', format: 'email' },
                  notification: { type: 'string' },
                },
                required: ['teacher', 'notification'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Recipients for the notification',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    recipients: {
                      type: 'array',
                      items: { type: 'string', format: 'email' },
                    },
                  },
                },
              },
            },
          },
          400: { description: 'Missing teacher or notification' },
          404: { description: 'Teacher not found' },
        },
      },
    },
  },
};

const swaggerOptions = {
  swaggerDefinition,
  apis: [],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(express.json());
app.use('/api', routes);
app.use(errorHandler);

module.exports = app;
