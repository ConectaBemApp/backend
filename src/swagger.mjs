import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    version: '1.0.0',
    title: 'ConectaBem APIs',
    description: 'APIs para o projeto ConectaBem',
  },
  servers: [
    {
      url: ['http://localhost:3000', 'https://conectabemback.onrender.com'],
    },
  ],
  tags: [
    {
      name: 'User',
      description: 'Endpoints relacionados aos usuários',
    },
    {
      name: 'Test',
      description: 'Endpoints de teste'
    }
  ],
  host: 'localhost:3000',
  basePath: '/',
  schemes: ['http'],
};

const outputFile = './../swagger-output.json';
const routes = ['./Routes/route.mjs'];

swaggerAutogen({ language: 'pt-BR' })(outputFile, routes, doc);
