// Imports
import express from "express";
import path from "path";
import { __dirname } from "./utils.js";
import session from "express-session";
import passport from "passport";
import initializePassport from "./config/passport.config.js";
import MongoStore from "connect-mongo";
import cookieParser from "cookie-parser";
import MongoSingleton from "./config/singleton.config.js";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUIExpress from "swagger-ui-express";
import cors from 'cors'

//.env configuration
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(__dirname, "config", ".env") });
import config from "./config/config.js";

//Routes imports
import cartRouter from "./routes/carts.route.js";
import productRouter from "./routes/products.route.js";
import sessionsRouter from "./routes/sessions.router.js";
import loggerTestRouter from "./routes/logger.routes.js";
import { addLogger } from "./config/loggerCustom.js";


const app = express();

//cors
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true}
));

// Aplica el middleware del logger
app.use(addLogger);

const port = config.port;

const httpServer = app.listen(port, () =>
  console.log(`Server listening on port ${port}`)
);

const secret = config.sessionSecret;

//configuracoón de Session
app.use(
  session({
    store: MongoStore.create({
      mongoUrl: config.mongoUrl,
      ttl: 10 * 60,
    }),
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(cookieParser(secret));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Documentation API Adome",
      version: '1.0.0',
      description: "Swagger's documentation"
    },
  },
  apis: [`./src/docs/**/*.yaml`],
};

const specs = swaggerJSDoc(swaggerOptions)
app.use('/apidocs', swaggerUIExpress.serve, swaggerUIExpress.setup(specs))

//Routes
app.use(express.static(`${__dirname}/public`));

app.use("/api/products", productRouter);
app.use("/api/carts", cartRouter);
app.use("/api/users", sessionsRouter);
app.use("/loggerTest", loggerTestRouter);

//Passport Middleware
initializePassport();
app.use(passport.initialize());
app.use(passport.session());


export default app;
