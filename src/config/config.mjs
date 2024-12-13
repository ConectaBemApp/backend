import 'dotenv/config'

export default {
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DP_PASSWORD,
  PORT: process.env.PORT || 3000,
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY
};