import express from 'express';
import cors from 'cors';
import { checkUserEmailSendOTP, checkOTP } from './../controller/userController.mjs';

const router = express.Router();

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = ['https://backend-conectabem.onrender.com', 'http://localhost:3000'];
    /* console.log(`Origin: ${origin}`); */

    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  optionsSuccessStatus: 200,
};

router.use(cors(corsOptions));

router.post('/auth/checkUserSendOTP', checkUserEmailSendOTP);
router.post('/auth/checkOTP', checkOTP);

router.get('/', (req, res) => {
  /*
    #swagger.tags = ['Test']
    #swagger.summary = 'Teste para verificar se API está funcionando'
  */
  console.log('API is working!');
  return res.status(200).json({ message: 'API is working' });
});

export default router;
