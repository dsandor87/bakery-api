const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// HTML Email Template in Hungarian
const generateEmailTemplate = (name, email, phone, message) => {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2 style="color: #4CAF50;">Új kapcsolatfelvételi űrlap beküldés</h2>
      <p><strong>Név:</strong> ${name}</p>
      <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
      <p><strong>Telefonszám:</strong> ${phone}</p>
      <p><strong>Üzenet:</strong></p>
      <p style="padding: 10px; background-color: #f9f9f9; border-left: 5px solid #4CAF50;">${message}</p>
      <hr>
      <p style="font-size: 0.9em; color: #777;">Ez az email az Ön weboldalának kapcsolatfelvételi űrlapjáról lett küldve.</p>
    </div>
  `;
};

// API endpoint to handle contact form submission
app.post("/api/sendEmail", (req, res) => {
  const { name, email, phone, message } = req.body;

  const mailOptions = {
    from: email,
    to: process.env.EMAIL_USER,
    subject: `Új üzenet ${name} feladótól`,
    html: generateEmailTemplate(name, email, phone, message),
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error occurred while sending email:", error);
      return res
        .status(500)
        .json({
          message: "Az email küldése sikertelen",
          error: error.toString(),
        });
    }
    console.log("Email sent:", info.response);
    res.status(200).json({ message: "Az email sikeresen elküldve" });
  });
});

// Start server
app.listen(port, () => {
  console.log(`A szerver a ${port} porton fut`);
});
