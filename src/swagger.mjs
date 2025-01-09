import swaggerAutogen from "swagger-autogen";

const doc = {
  info: {
    version: "1.0.0",
    title: "ConectaBem APIs",
    description: "APIs para o projeto ConectaBem",
  },
  servers: [{ url: "http://localhost:3000" }, { url: "https://conectabemback.onrender.com" }],
  tags: [
    {
      name: "User",
      description: "Endpoints relacionados aos usuários",
    },
    {
      name: "Test",
      description: "Endpoints de teste",
    },
  ],
  host: "conectabemback.onrender.com",
  basePath: "/",
  schemes: ["http", "https"],
  definitions: {
    AddUserPaciente: {
      $userId: 1234,
      $name: "Thiago Cabral",
      $birthdayDate: "20/12/2003",
      $userSpecialities: ["Acumputura", "Aromaterapia"],
      $userServicePreferences: ["LGBTQIA+ Friendly", "Pet Friendly"],
      userAcessibilityPreferences: ["Atendimento em Libras", "Audiodescrição"],
      profilePhoto: "https://www.url/url",
    },
    AddUserProfessional: {
      $userId: 1234,
      $name: "Ronaldinho Gaúcho",
      $birthdayDate: "20/12/2003",
      $cepResidencial: "12345-678",
      $nomeClinica: "Clinica do seu José",
      $CNPJCPFProfissional: "123.456.789-10",
      $cepClinica: "12345-678",
      $enderecoClinica: "Rua Perto da Qui",
      complementoClinica: "Casa",
      $professionalSpecialities: ["Acumputura", "Aromaterapia"],
      otherProfessionalSpecialities: ["Yoga na água", "Corrente russa"],
      $professionalServicePreferences: ["LGBTQIA+ Friendly", "Pet Friendly"],
      profilePhoto: "https://www.url/url",
    },
  },
};

const outputFile = "./../swagger-output.json";
const routes = ["./routes/route.mjs"];

swaggerAutogen({ language: "pt-BR" })(outputFile, routes, doc);
