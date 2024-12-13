import express from 'express';
import mongoose from 'mongoose';
import router from './Routes/route.mjs';
import swaggerUI from 'swagger-ui-express';
import swaggerFile from './../swagger-output.json' with {type: 'json'};
import config from './config/config.mjs';

const app = express();
app.use(express.json());

app.use("/doc", swaggerUI.serve, swaggerUI.setup(swaggerFile));
app.use("/", router);
app.get('/', (req, res) => {
  res.send('Successful response.');
});

mongoose
  .connect(
    `mongodb+srv://${config.DB_USER}:${config.DB_PASSWORD}@cluster0.rczok.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
  )
  .then(() => {
    app.listen(3000);
    console.log("Conectou ao banco com sucesso");
  })
  .catch((error) => console.log(error));
