//PRODUCT MANAGER
import { productModel } from "./mongo/models/product.model.js";
import * as ProductController from "../controllers/product.controller.js";

class ProductManager {
  constructor() {
    this.model = productModel;
  }
  // To add a Product:
  async addProduct(product) {
    try {
      await ProductController.saveProduct(product);
    } catch (err) {
      throw err;
    }
  }

  // To get all products:
  async getProducts() {
    try {
      return ProductController.getAllProducts();
    } catch (err) {
      throw err;
    }
  }
  // To get a product by id
  async getProductById(id) {
    try {
      return await ProductController.getProductById(id);
    } catch (err) {
      throw err;
    }
  }
  // To check if the product exists:
  async productExists(id) {
    try {
      return await ProductController.productExists(id);
    } catch (err) {
      throw err;
    }
  }
  // To subtract the quantity of a product:
  async restProductQuantity(productId, quantity) {
    try {
      const product = await this.getProductById(productId);
      if (!product.stock >= quantity) {
        return false;
      } else {
        product.stock -= quantity;
        this.updateProduct(product);
        return true;
      }
    } catch (err) {
      throw err;
    }
  }
  // To update a product:
  async updateProduct(product) {
    try {
      return await ProductController.updateProduct(product);
    } catch (err) {
      throw err;
    }
  }
  // To delete a product by id
  async deleteProduct(id) {
    try {
      return await this.model.findByIdAndDelete(id);
    } catch (err) {
      throw err;
    }
  }
  // To delete product by code
  async deleteProductByCode(code) {
    try {
      return await this.model.deleteOne({ code: code });
    } catch (err) {
      throw err;
    }
  }
}

export { ProductManager };
