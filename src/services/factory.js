import config from "../config/config.js";
import MongoSingleton from "../config/singleton.config.js";

let productService;
let userService;
let cartService;
let ticketService;

async function initializeMongoService() {
  try {
      await MongoSingleton.getInstance();
  } catch (error) {
      console.error("Error al iniciar MongoDB:", error);
      process.exit(1); 
  }
}

// factory configuration
switch (config.persistance) {
  case "mongodb":
    initializeMongoService();
    const { default: UserServiceMongo } = await import('../daos/mongo/users.service.js')
    userService = new UserServiceMongo

    const { default: TicketServiceMongo } = await import('../daos/mongo/ticket.service.js')
    ticketService = new TicketServiceMongo

    const { default: ProductsServiceMongo } = await import('../daos/mongo/products.service.js')
    productService = new ProductsServiceMongo

    const { default: CartsServiceMongo } = await import('../daos/mongo/carts.service.js')
    cartService = new CartsServiceMongo
    break;


  case "file":
    const { default: ProductServiceFileSystem } = await import('../daos/filesystem/products.service.js')
    productService = new ProductServiceFileSystem

    const { default: UserServiceFileSystem } = await import('../daos/filesystem/users.service.js')
    userService = new UserServiceFileSystem

    const { default: CartServiceFileSystem } = await import('../daos/filesystem/carts.service.js')
    cartService = new CartServiceFileSystem
    break;

default:
    console.error("Persistencia no válida en la configuración:", config.persistance);
    process.exit(1); 
    break;
}


export { productService, userService, cartService, ticketService };
