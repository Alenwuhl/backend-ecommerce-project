import { Router } from "express";
import userModel from "../daos/mongo/models/user.model.js";
import { generateJWToken, isValidPassword } from "../utils.js";
import * as UserController from "../controllers/user.controller.js";
import { createHash } from "../utils.js";
import { UserManager } from "../daos/UserManager.js";
import path from "path";
import { __dirname } from "../utils.js";
import fs from "fs";
import multer from "multer";
import UsersDto from "../services/dto/user.dto.js"

const router = Router();
const userManager = new UserManager();

// To bring all users:
router.get("/", UserController.getAllUsers);

// To save a user: 
router.post("/", UserController.saveUser);

// To change user role:
router.post("/role/:uid", async (req, res) => {
  try {
      const { uid } = req.params;
      const { newRole } = req.body;

      if (!uid || !newRole || !["user", "premium", "admin"].includes(newRole)) {
          return res.status(400).json({ error: "Invalid data provided" });
      }

      const user = await userModel.findById(uid);
      if (!user) {
          return res.status(404).json({ error: "User not found" });
      }

      user.role = newRole;
      await user.save();
      res.status(200).json({ message: "User role updated successfully" });
  } catch (error) {
      res.status(500).json({ error: error.message, message: "Error updating user role" });
  }
});

// To delete user by id:
router.delete("/user/:uid", async (req, res) => {
  try {
      const { uid } = req.params;

      const result = await userModel.deleteOne({ _id: uid });
      if (result.deletedCount === 0) {
          return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
      res.status(500).json({ error: error.message, message: "Error deleting user" });
  }
});

// To bring the current user:
router.get("/current", (req, res) => {
  try {
    let currentUser = req.session.user;
    let usersDto = new UsersDto(currentUser);
    res.send(usersDto);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ error: error, message: "No se pudo obtener el usuario activo." });
  }
});

// To delete inactive user in the last 48 hours:
router.delete("/deleteInactiveUsers", async (req, res) => {
  try {
    const deletedCount = await userManager.deleteInactiveUser();
    res.json({ message: `Deleted ${deletedCount} inactive users.` });
  } catch (error) {
    res
      .status(500)
      .json({
        error: error.message,
        message: "Error deleting inactive users.",
      });
  }
});

// To start the process to reset the password:
router.post("/process-to-reset-password", (req, res) =>
  userManager.sendEmailToResetPasssword(req, res)
);

// To reset the password
router.post("/resetPassword/:token", (req, res) =>
  userManager.resetPassword(req, res)
);

// To improve the user's role, requiring the documents:
router.post("/premium/:uid", (req, res) =>
  userManager.changeUserRole(req, res)
);
const storagePaths = ["profiles", "products", "documents", "other"];
storagePaths.forEach((dir) => {
  const storagePath = path.join(__dirname, "..", "uploads", dir);
  if (!fs.existsSync(storagePath)) {
    fs.mkdirSync(storagePath, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let folder = "other";
    switch (file.fieldname) {
      case "profileImage":
        folder = "profiles";
        break;
      case "productImage":
        folder = "products";
        break;
      case "1":
      case "2":
      case "3":
        folder = "documents";
        break;
    }
    cb(null, path.join(__dirname, "..", "uploads", folder));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
  if (!allowedTypes.includes(file.mimetype)) {
    const error = new Error(
      `Invalid file type. Only ${allowedTypes.join(", ")} are allowed.`
    );
    error.code = "LIMIT_FILE_TYPES";
    cb(error, false);
  } else {
    cb(null, true);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5 MB
  },
}).fields([
  { name: "1", maxCount: 1 },
  { name: "2", maxCount: 1 },
  { name: "3", maxCount: 1 },
]);

// To upload documents:
router.post("/:uid/documents", (req, res) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: err.message });
    } else if (err) {
      if (err.message === "Unexpected field") {
        return res
          .status(400)
          .json({ error: "One of the uploaded fields is not recognized." });
      }
      return res.status(500).json({ error: "A server error occurred." });
    }

    userManager.uploadDocuments(req, res);
  });
});

//Register
router.post("/register", async (req, res) => {
  const { first_name, last_name, email, age, password, role } = req.body;
  req.logger.debug("Registrando usuario:");
  req.logger.debug(req.body);

  // We validate if the user exists in the DB
  const exist = await userModel.findOne({ email });
  if (exist) {
    return res
      .status(400)
      .send({ status: "error", message: "Usuario ya existe!" });
  }
  const user = {
    first_name,
    last_name,
    email,
    age,
    password: createHash(password),
    role,
  };

  const result = await userModel.create(user);
  res.send({
    status: "success",
    message: "Usuario creado con extito con ID: " + result.id,
  });
});

// Login
router.post("/login", async (req, res) => {
  try {
    req.logger.http("se entró a api/users/login");
    const { email, password } = req.body;
    
    const user = await userModel.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ status: "error", error: "No se encontró el usuario" });
    }
    
    if (!isValidPassword(user, password)) {
      return res.status(401).json({ status: "error", error: "Credenciales incorrectas" });
    }
    
    user.last_connection = new Date();
    await user.save();
    
    req.session.user = {
      name: `${user.first_name} ${user.last_name}`,
      email: user.email,
      age: user.age,
      id: user.id,
      role: user.role,
    };

    // Send the response with the token
    res.json({
      status: "success",
      message: "Usuario con login exitoso",
      token: generateJWToken(user),
    });
  } catch (error) {
    req.logger.error("Error en /login: ", error);
    res.status(500).json({ status: "error", error: "Internal server error" });
  }
});

export default router;
