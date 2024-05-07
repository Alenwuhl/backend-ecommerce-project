import { __dirname } from "../../utils.js";
import fileSystem from "fs";

class CartService {
  #carts;
  #dirPath;
  #filePath;
  #fileSystem;

  constructor() {
    this.#carts = new Array();
    this.#dirPath = __dirname + "/files";
    this.#filePath = this.#dirPath + "/carts.json";
    this.#fileSystem = fileSystem;
  }

  #prepararDirectorioBase = async () => {
    await this.#fileSystem.promises.mkdir(this.#dirPath, { recursive: true });
    if (!this.#fileSystem.existsSync(this.#filePath)) {
      await this.#fileSystem.promises.writeFile(this.#filePath, "[]");
    }
  };

  async getCartById(cartId) {
    await this.#prepararDirectorioBase();
    const carts = await this.getAll();
    return carts.find((cart) => String(cart.id) === String(cartId));
  }

  async createCart() {
    const newCart = { id: Math.floor(Math.random() * 20000 + 1), items: [] };
    await this.save(newCart);
    return newCart;
  }

  async save(cart) {
    if (!cart.id) {
      cart.id = Math.floor(Math.random() * 20000 + 1);
    }
    try {
      await this.#prepararDirectorioBase();
      this.#carts = await this.getAll();

      const index = this.#carts.findIndex((c) => c.id === cart.id);
      if (index !== -1) {
        this.#carts[index] = cart;
      } else {
        this.#carts.push(cart);
      }

      await this.#fileSystem.promises.writeFile(
        this.#filePath,
        JSON.stringify(this.#carts)
      );
    } catch (error) {
      console.error(`Error guardando el carrito: ${error}`);
      throw new Error(`Error guardando el carrito: ${error}`);
    }
  }

  async getAll() {
    try {
      await this.#prepararDirectorioBase();
      let data = await this.#fileSystem.promises.readFile(
        this.#filePath,
        "utf-8"
      );

      if (data.trim()) {
        this.#carts = JSON.parse(data);
      } else {
        this.#carts = [];
      }
      return this.#carts;
    } catch (error) {
      console.error(
        `Error consultando los carritos por archivo, valide el archivo: ${
          this.#dirPath
        }, detalle del error: ${error}`
      );
      throw new Error(
        `Error consultando los carritos por archivo, valide el archivo: ${
          this.#dirPath
        }, detalle del error: ${error}`
      );
    }
  }
}

export default CartService;
