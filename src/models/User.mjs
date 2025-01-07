import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  hashedOTP: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["paciente", "profissional"], // Assegura que o valor do role seja um dos dois
  },
  name: String,
  birthdayDate: Date,
  cepResidencial: String,
  nomeClinica: String,
  CNPJCPFProfissional: String,
  cepClinica: String,
  enderecoClinica: String,
  complementoClinica: String,
  professionalSpecialities: [String],
  otherProfessionalSpecialities: [String],
  professionalServicePreferences: [String],
  userSpecialities: [String],
  userServicePreferences: [String],
  userAcessibilityPreferences: [String],
  profilePhoto: String,
});

const User = mongoose.model("User", userSchema);
export default User;
