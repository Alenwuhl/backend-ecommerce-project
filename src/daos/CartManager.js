//CART MANAGER
import { cartModel } from "./mongo/models/cart.model.js";
import * as CartController from "../controllers/cart.controller.js";
import { ProductManager } from "./ProductManager.js";
import TicketManager from "./TicketManager.js";
class CartManager {
  constructor() {
    this.model = cartModel;
    this.productManager = new ProductManager();
  }
  // To complete de purchase
  async finishBuying(cartId, user) {
    const cart = await cartModel.findById(cartId);
    if (!cart) {
      throw new Error("Carrito no encontrado");
    }

    let unavailableProducts = [];
    let purchaseTotal = 0;
    let availableProducts = [];

    const productChecks = cart.items.map(async (item) => {
      let product = await this.productManager.getProductById(item.productId);

      if (!product) {
        throw new Error("Item not found");
      }
      if (product.stock < item.quantity) {
        unavailableProducts.push(product);
      } else {
        purchaseTotal += product.price * item.quantity;
        let result = await this.productManager.restProductQuantity(
          product.id,
          item.quantity
        );
        if (!result) {
          unavailableProducts.push(product);
        } else {
          availableProducts.push(item);
        }
      }
    });
    await Promise.all(productChecks);
    let ticketManager = new TicketManager();
    const result = await ticketManager.addTicketFromCart(
      availableProducts,
      purchaseTotal,
      user
    );
    return { unavailableProducts, purchaseTotal, availableProducts, result };
  }

  async addCart(cart) {
    // Check if all products in the cart exist
    const productIds = cart.items.map((item) => item.productId);
    try {
      for (const productId of productIds) {
        const productExists = await this.productManager.productExists(
          productId
        );
        if (!productExists) {
          throw new Error(`Producto con ID ${productId} no encontrado.`);
        }
      }
      let result = await CartController.saveCart(cart);
      return result;
    } catch (err) {
      throw err;
    }
  }
  // To get all carts
  async getCarts() {
    try {
      return CartController.getAllCarts();
    } catch (err) {
      throw err;
    }
  }
  // To get cart by id
  async getCartById(id) {
    try {
      return await this.model.findById(id);
    } catch (err) {
      throw err;
    }
  }
  // To update an item from the cart
  async updateCartItem(id, updatedFields) {
    try {
      return await this.model.findByIdAndUpdate(id, updatedFields, {
        new: true,
      });
    } catch (err) {
      throw err;
    }
  }
  // To add product to a cart
  async addProductToCart(cartId, productId, quantity) {
    try {
      // Verificar si el producto existe
      const product = await this.productManager.getProductById(productId);
      if (!product) {
        throw new Error(`Producto con ID ${productId} no encontrado.`);
      }
      return await CartController.addProductToCart(cartId, productId, quantity);
    } catch (err) {
      throw err;
    }
  }
  // To remove a specific product from a specific cart:
  async deleteCartProduct(cartId, productId) {
    try {
      let cart = await this.model.findById(cartId);

      if (!cart) {
        throw new Error("Carrito no encontrado");
      }

      cart.items = cart.items.filter(
        (item) => item.productId.toString() !== productId
      );

      await cart.save();
    } catch (error) {
      console.error(
        "Hubo un error al eliminar el producto del carrito:",
        error
      );
      throw error;
    }
  }
  // To delete a cart by id
  async deleteCart(cartId) {
    try {
      const cart = await this.model.findByIdAndDelete(cartId);
      if (!cart) {
        throw new Error("Carrito no encontrado");
      }
    } catch (error) {
      console.error("Hubo un error al eliminar el carrito:", error);
      throw error;
    }
  }
}

export { CartManager };
