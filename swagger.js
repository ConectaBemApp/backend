const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'ConectaBem APIs',
    description: 'APIs para o projeto ConectaBem',
  },
  host: 'localhost:3000',
  basePath: '/',
  schemes: ['http'],
  tags: [
    {
      name: 'User',
      description: 'Endpoints relacionados aos usuários'
    }
  ]
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./path/UserRoutes.js'];

swaggerAutogen(outputFile, endpointsFiles, doc);