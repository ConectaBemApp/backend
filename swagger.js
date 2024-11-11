const swaggerAutogen = require('swagger-autogen')({ openapi: '3.0.0', language: 'pt-BR' });

const doc = {
  info: {
    version: '1.0.0',
    title: 'ConectaBem Back-end APIs',
    description: 'APIs para o projeto ConectaBem',
  },
  servers: [
    {
      url: 'http://localhost:3000',
    },
  ],
  tags: [
    {
      name: 'User',
      description: 'Endpoints relacionados aos usuários',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
      },
    },
  },
  host: 'localhost:3000',
  basePath: '/',
  schemes: ['http'],
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./path/UserRoutes.js'];

swaggerAutogen(outputFile, endpointsFiles, doc);
