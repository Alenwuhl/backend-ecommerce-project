import { Router } from "express";
import { ProductManager } from "../daos/ProductManager.js";
import { authorization } from "../utils.js";
import config from "../config/config.js";
import userModel from "../daos/mongo/models/user.model.js";
import { EmailManager } from "../daos/EmailManager.js";

const router = Router();
const productManager = new ProductManager();
const emailManager = new EmailManager()

// To bring all the products:
router.get("/", async (req, res) => {
  const products = await productManager.getProducts();
  const { limit } = req.query;

  if (!limit) {
    try {
      res.json(products);
    } catch (error) {
      req.logger.error(`Hubo un error al devolver los productos - ${error}`);
      res.status(500).send("Hubo un error al devolver los productos");
    }
  } else {
    try {
      const parsedLimit = parseInt(limit);

      if (isNaN(parsedLimit) || parsedLimit <= 0) {
        return res.send(
          `El parametro que estableciste como limite (${limit} no es un numero entero.)`
        );
      }
      const limitedProducts = products.slice(0, parsedLimit);
      res.json(limitedProducts);
    } catch (error) {
      req.logger.error(
        `Hubo un error al devolver los productos con el limite determinado ${error}`
      );
      res
        .status(500)
        .send(
          "Hubo un error al devolver los productos con el limite determinado"
        );
    }
  }
});

// To get a product by Id:
router.get("/:pID", async (req, res) => {
  const { pID } = req.params;

  if (!pID || pID.trim() === "") {
    try {
      const products = await productManager.getProducts();
      res.json(products);
    } catch (error) {
      req.logger.error("Hubo un error al devolver los productos", error);
      res.status(500).send("Hubo un error al devolver los productos");
    }
  } else {
    try {
      const product = await productManager.getProductById(pID);
      res.json(product);
    } catch (error) {
      req.logger.error(
        "Hubo un error al devolver los productos a traves del ID",
        error
      );
      res
        .status(500)
        .send(
          `Hubo un error al devolver los productos a traves del ID: ${pID}`
        );
    }
  }
});

// To add a product:
router.post("/", async (req, res) => {
  try {
    const { title, description, code, price, stock } = req.body;
    if (!title || !description || !code || !price || !stock) {
      return res
        .status(400)
        .json({ error: "Faltan propiedades obligatorias." });
    }
    const productData = {
      ...req.body,
      owner: req.session.user.email,
    };
    const product = await productManager.addProduct(productData);
    res.json({ product });
    req.logger.http("Se entró a router.POST - api/products");
  } catch (error) {
    req.logger.error("Hubo un error al agregar el producto");
    res.status(500).send("Hubo un error al agregar el producto");
  }
});

// To update a product:
router.put("/:pid", async (req, res) => {
  const { pid } = req.params;
  try {
    const existingProduct = await productManager.getProductById(pid);

    if (!existingProduct) {
      return res.status(404).send(`El producto con ID ${pid} no existe.`);
    }

    await productManager.updateProduct(pid, req.body);

    res.json({
      message: `Producto con ID ${pid} actualizado.`,
    });
  } catch (error) {
    req.logger.error("Hubo un error al actualizar el producto", error);
    res.status(500).send("Hubo un error al actualizar el producto");
  }
});

// To delete a product, if the product is owned by a premium user, I will send you an email notifying you of the deletion.
router.delete("/:pid", async (req, res) => {
  const { pid } = req.params;
  try {
    const product = await productManager.getProductById(pid);
    if (!product) {
      return res.status(404).send("Producto no encontrado");
    }

    const deletedProduct = await productManager.deleteProduct(pid);

    // Get the product owner user
    const owner = await userModel.findOne({ email: deletedProduct.owner });

    if (owner.role === "premium") {
      // Send email if the owner is "premium"
      const email = {
        from: `${config.gmailAccount}`,
        to: `${owner.email}`,
        subject: "Producto Eliminado",
        html: `
                    <h1>Producto Eliminado</h1>
                    <p>Estimado usuario,</p>
                    <p>Lamentamos informarte que tu producto ha sido eliminado.</p>
                    <table>
                        <tr>
                            <td><strong>Título:</strong></td>
                            <td>${deletedProduct.title}</td>
                        </tr>
                        <tr>
                            <td><strong>Descripción:</strong></td>
                            <td>${deletedProduct.description}</td>
                        </tr>
                        <tr>
                            <td><strong>Precio:</strong></td>
                            <td>$${deletedProduct.price}</td>
                        </tr>
                        <tr>
                            <td><strong>Código:</strong></td>
                            <td>${deletedProduct.code}</td>
                        </tr>
                    </table>
                    <p>Si tienes alguna pregunta, no dudes en ponerte en contacto con nosotros.</p>
                    <p>Saludos!</p>
                `,
      };

      // Try to send the email
      try {
        await emailManager.sendEmail(email);
      } catch (emailError) {
        req.logger.error("Error al enviar el correo", emailError);
      }
    }

    res.json(deletedProduct);
  } catch (error) {
    req.logger.error("Hubo un error al borrar el producto -", error);
    res.status(500).send("Hubo un error al borrar el producto");
  }
});

export default router;
