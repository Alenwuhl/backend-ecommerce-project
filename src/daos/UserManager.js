import config from "../config/config.js";
import userModel from "./mongo/models/user.model.js";
import { v4 } from "uuid";
import { EmailManager } from "./EmailManager.js";
import * as userController from "../controllers/user.controller.js";
import * as utils from "../utils.js";

class UserManager {
  constructor() {
    this.model = userModel;
    this.emailManager = new EmailManager();
    this.resetTokens = {};
  }

  // To upload Documents:
  async uploadDocuments(req, res) {
    const { uid } = req.params;
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send({ error: "No documents uploaded" });
    }

    const user = await userModel.findById(uid);
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }
    // To simplify document names:
    const docTypes = {
      1: "Identificación",
      2: "Comprobante de domicilio",
      3: "Comprobante de estado de cuenta",
    };

    const newDocuments = Object.values(req.files)
      .flat()
      .map((file) => ({
        type: docTypes[file.fieldname],
        name: file.originalname,
        reference: file.path,
      }));

    const result = await userController.updateUser(
      { _id: uid },
      { $push: { documents: { $each: newDocuments } } }
    );

    if (result && !result.error) {
      res.send({
        message: "Documents uploaded successfully",
        documents: newDocuments,
      });
    } else {
      res
        .status(500)
        .send({ error: "Failed to save documents", details: result });
    }
  }

  // To delete inactive users:
  async deleteInactiveUser() {
    try {
      const cutoffDate = new Date(Date.now() - 10 * 1000); // 48 hours ago

      // Retrieve users who are inactive
      const inactiveUsers = await userModel.find({
        last_connection: { $lt: cutoffDate },
      });

      const userEmails = inactiveUsers.map((user) => user.email);

      await Promise.all(
        userEmails.map((email) => this.sendDeletionNotification(email))
      );

      const result = await userModel.deleteMany({
        last_connection: { $lt: cutoffDate },
      });

      return result.deletedCount;
    } catch (error) {
      console.error("Error deleting inactive users:", error);
      throw error;
    }
  }
  // To send deletion notification
  async sendDeletionNotification(email) {
    const notificationEmail = {
      from: `${config.gmailAccount}`,
      to: email,
      subject: "Account Deletion Notice",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
          <h2 style="color: #d9534f; text-align: center;">Account Deletion Notice</h2>
          <p>Hello,</p>
          <p>Your account has been deleted due to inactivity exceeding 48 hours.</p>
          <p>If you'd like to continue using our services, we welcome you to register again:</p>
          <p style="text-align: center; margin: 30px 0;"><a href="https://localhost:3000/api/users/register" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Register Again</a></p>
          <p>We hope to see you back soon!</p>
          <p>If you did not expect this message, please disregard it.</p>
        </div>
      `,
    };
    try {
      await this.emailManager.sendEmail(notificationEmail);
    } catch (error) {
      console.error(`Error sending notification to ${email}:`, error);
    }
  }

  // To change user role:
  async changeUserRole(req, res) {
    try {
      const { uid } = req.params;
      const { newRole } = req.body;

      if (!uid) {
        return res.status(400).send("User id not provided");
      }
      if (!newRole || (newRole !== "user" && newRole !== "premium")) {
        return res.status(400).send("Invalid role provided");
      }

      const user = await userModel.findById(uid);
      if (!user) {
        return res.status(404).send("User not found with the provided id");
      }

      if (newRole === "premium" && user.role === "user") {
        const docTypes = {
          1: "Identificación",
          2: "Comprobante de domicilio",
          3: "Comprobante de estado de cuenta",
        };

        const requiredDocs = Object.keys(docTypes).map((key) => docTypes[key]);
        const uploadedDocsTypes = user.documents.map((doc) => doc.type);
        const hasAllDocs = requiredDocs.every((type) =>
          uploadedDocsTypes.includes(type)
        );
        if (!hasAllDocs) {
          return res.status(400).send({
            error:
              "All required documents must be uploaded and processed to upgrade to premium",
          });
        }
      }

      const updateResult = await userModel.updateOne(
        { _id: uid },
        { role: newRole }
      );
      if (updateResult.modifiedCount === 1) {
        return res.status(200).send(`User role updated to ${newRole}`);
      } else {
        return res.status(400).send("Failed to update user role");
      }
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).send("Internal server error");
    }
  }

  // To send email to reset password:
  async sendEmailToResetPasssword(req, res) {
    try {
      const { emailToReset } = req.body;
      if (!emailToReset) {
        return res.status(400).send("Email not provided");
      }

      const user = await userController.findByEmail(emailToReset);
      if (!user) {
        return res.status(404).send("User not found with the provided email");
      }

      const resetToken = v4();
      this.resetTokens[resetToken] = {
        email: emailToReset,
        expires: Date.now() + 3600000,
      };

      let email = {
        from: `${config.gmailAccount}`,
        to: `${emailToReset}`,
        subject: "Restablecimiento de contraseña",
        html: `
          <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
            <h2 style="color: #007bff; text-align: center;">Restablecimiento de Contraseña Solicitado</h2>
            <p>Hola,</p>
            <p>Has recibido este correo electrónico porque tú (o alguien más) ha solicitado el restablecimiento de la contraseña de tu cuenta.</p>
            <p>Para restablecer tu contraseña, por favor haz clic en el siguiente enlace:</p>
            <p style="text-align: center; margin: 30px 0;"><a href="https://localhost:3000/api/users/resetPassword/${resetToken}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Restablecer mi contraseña</a></p>
            <p>Si no has solicitado esto, por favor ignora este correo electrónico y tu contraseña permanecerá sin cambios.</p>
            <p>El enlace para restablecer la contraseña es válido por 1 hora.</p>
          </div>
        `,
        attachments: [],
      };

      await this.emailManager.sendEmail(email);
      res.send("Reset password email has been sent");
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .send({ error: error.message, message: "No se pudo enviar el correo" });
    }
  }

  isTokenValid(token) {
    const tokenData = this.resetTokens[token];
    if (!tokenData) return false;
    return Date.now() <= tokenData.expires;
  }
  // To reset the password:
  async resetPassword(req, res) {
    try {
      const { token } = req.params;
      const { newPassword } = req.body;

      const tokenData = this.resetTokens[token];
      if (!tokenData || Date.now() > tokenData.expires) {
        return res.redirect("/api/users/process-to-reset-password");
      }

      const user = await userController.findByEmail(tokenData.email);
      if (!user) {
        return res
          .status(404)
          .send("Usuario no encontrado. Prueba registrarte.");
      }

      const isSamePassword = utils.isValidPassword(user, newPassword);
      if (isSamePassword) {
        return res
          .status(400)
          .send(
            "La nueva contraseña no puede ser igual a la contraseña actual."
          );
      }

      await userController.updatePassword(tokenData.email, newPassword);

      // Removed reset token to prevent reuse
      delete this.resetTokens[token];

      res.send("Contraseña actualizada con éxito.");
    } catch (error) {
      console.error(error);
      res.status(500).send({
        error: error.message,
        message: "Error al restablecer la contraseña",
      });
    }
  }
}

export { UserManager };
