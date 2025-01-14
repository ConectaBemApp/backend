import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import express from "express";
import bcrypt from "bcrypt";
import { checkUserEmailSendOTP } from "../userController.mjs";
import User from "../../models/User.mjs";

vi.mock("bcrypt");
vi.mock("../../models/User.mjs");
vi.mock("../../utils/generateOTP.mjs");
vi.mock("../../utils/sendEmail.mjs");

const app = express();
app.use(express.json());
app.post("/checkUserEmailSendOTP", checkUserEmailSendOTP);

describe("Teste para checkUserEmailSendOTP", () => {
  it("deve retornar 422 se o e-mail não for fornecido ou for inválido", async () => {
    const res = await request(app).post("/checkUserEmailSendOTP").send({ email: "" });
    expect(res.status).toBe(422);
    expect(res.body.message).toBe("Um e-mail é exigido");
  });

  it("deve retornar 201 se o usuário for criado e o OTP for enviado", async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({ _id: "12345", email: "teste@exemplo.com" });
    bcrypt.genSalt.mockResolvedValue("salt");
    bcrypt.hash.mockResolvedValue("hashedOTP");

    const res = await request(app).post("/checkUserEmailSendOTP").send({ email: "teste@exemplo.com" });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.email.exists).toBe(false);
    expect(res.body.message).toBe("User created and OTP sent through email");
  });

  it("deve retornar 200 se o usuário já existir e o OTP for atualizado e enviado", async () => {
    User.findOne.mockResolvedValue({ _id: "12345", email: "teste@exemplo.com" });
    User.updateOne.mockResolvedValue({});
    bcrypt.genSalt.mockResolvedValue("salt");
    bcrypt.hash.mockResolvedValue("hashedOTP");

    const res = await request(app).post("/checkUserEmailSendOTP").send({ email: "teste@exemplo.com" });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id");
    expect(res.body.email.exists).toBe(true);
    expect(res.body.message).toBe("User OTP updated and sent");
  });

  it("deve retornar 500 em caso de erro no servidor", async () => {
    User.findOne.mockRejectedValue(new Error("Erro no servidor"));

    const res = await request(app).post("/checkUserEmailSendOTP").send({ email: "teste@exemplo.com" });

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Server error");
  });
});
