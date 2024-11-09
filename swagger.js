const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'ConectaBem APIs',
    description: 'APIs para o projeto ConectaBem',
  },
  host: 'localhost:3000'
};

const outputFile = './swagger-output.json';
const routes = ['./path/UserRoutes.js'];

swaggerAutogen(outputFile, routes, doc);