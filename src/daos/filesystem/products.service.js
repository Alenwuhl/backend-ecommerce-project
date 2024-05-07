import { __dirname } from "../../utils.js";
import fileSystem from "fs";

export default class ProductService {
  #products;
  #dirPath;
  #filePath;
  #fileSystem;

  constructor() {
    this.#products = new Array();
    this.#dirPath = __dirname + "/files";
    this.#filePath = this.#dirPath + "/products.json";
    this.#fileSystem = fileSystem;
  }

  #prepararDirectorioBase = async () => {
    await this.#fileSystem.promises.mkdir(this.#dirPath, { recursive: true });
    if (!this.#fileSystem.existsSync(this.#filePath)) {
      await this.#fileSystem.promises.writeFile(this.#filePath, "[]");
    }
  };

  save = async (product) => {
    product.id = Math.floor(Math.random() * 20000 + 1);
    try {
      await this.#prepararDirectorioBase();
      this.#products = await this.getAll();
      this.#products.push(product);
      await this.#fileSystem.promises.writeFile(
        this.#filePath,
        JSON.stringify(this.#products)
      );
    } catch (error) {
      console.error(`Error guardando producto: ${error}`);
      throw Error(`Error guardando producto: ${error}`);
    }
  };

  getAll = async () => {
    try {
      await this.#prepararDirectorioBase();
      let data = await this.#fileSystem.promises.readFile(
        this.#filePath,
        "utf-8"
      );
      this.#products = JSON.parse(data);
      return this.#products;
    } catch (error) {
      console.error(`Error consultando los productos por archivo, valide el archivo: ${
        this.#dirPath
      }, 
                detalle del error: ${error}`);
      throw Error(`Error consultando los productos por archivo, valide el archivo: ${
        this.#dirPath
      },
             detalle del error: ${error}`);
    }
  };

  async productExists(productId) {
    this.#products = await this.getAll();
    const product = this.#products.find((product) => product.id === productId);
    return product !== undefined;
  }

  async getProductById(productId) {
    this.#products = await this.getAll();
    return this.#products.find((product) => product.id === productId);
  }
}
