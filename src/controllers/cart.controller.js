// To work with Factory:
import { cartService } from "../services/factory.js";

// To work with repository:
//import { cartService } from '../services/repository.js';

export async function getAllCarts() {
  try {
    let carts = await cartService.getAll();
    return carts;
  } catch (error) {
    console.error(error);
    return error;
  }
}
export async function saveCart(cart) {
  try {
    // const studentDto = new StudentsDto(req.body);
    let result = await cartService.save(cart);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error("No se pudo guardar el carrito.");
  }
}

export async function addProductToCart(cartId, productId, quantity) {
  try {
    let cart = await cartService.getCartById(cartId);
    if (!cart) {
      cart = await cartService.createCart({ id: cartId, items: [] });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId === productId
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }
    await cartService.save(cart);

    return cart;
  } catch (error) {
    console.error(error);
    throw new Error("No se pudo agregar el producto al carrito.");
  }
}
