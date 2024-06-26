import nodemailer from "nodemailer";
import config from "../config/config.js";
 
 class EmailManager {
  async sendEmail(email) {
    // Transport configuration
    const transporter = nodemailer.createTransport({
      service: "gmail",
      port: 587,
      auth: {
        user: config.gmailAccount,
        pass: config.gmailAppPassword,
      },
    });
    // We verify connection with Gmail
    transporter.verify(function (error, success) {
      if (error) {
        console.log("Error verificando gmail", error);
      } else {
        console.log("Servidor pronto para enviar mails");
      }
    });
    transporter.sendMail(email, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Message sent: %s", info.messageId);
      }
    });
  }
}

export { EmailManager }