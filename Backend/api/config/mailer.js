import nodemailer from 'nodemailer'
import dotenv from 'dotenv';
dotenv.config();

const my_email = process.env.EMAIL_USER;
const app_password = process.env.EMAIL_PASS;

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'texasinstitution@gmail.com',
    pass: 'jraj cjne ysia mknp'   // App password for gmail

  }
});
//mailer.js


