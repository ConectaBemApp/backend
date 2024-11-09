// imports
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const userRoutes = require("./path/UserRoutes.js");
const swaggerUI = require("swagger-ui-express");
const swaggerFile = require("./swagger-output.json");

const app = express();

// Config JSON responses
app.use(express.json());

// Credencials
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASS;

app.use("/doc", swaggerUI.serve, swaggerUI.setup(swaggerFile));
app.use("/", userRoutes);


mongoose
  .connect(
    `mongodb+srv://${dbUser}:${dbPassword}@cluster0.rczok.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
  )
  .then(() => {
    app.listen(3000);
    console.log("Conectou ao banco com sucesso");
  })
  .catch((error) => console.log(error));
