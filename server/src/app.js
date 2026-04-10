import express from "express";
import cors from "cors";
import routes from "./routes/index.js";
import { env } from "./config/env.js";
import cookieParser from "cookie-parser";
import AppError from "./utils/AppError.js";
import swaggerUi from "swagger-ui-express";
import { swaggerSpecs } from "./config/swagger.js";

const app = express();

app.set("trust proxy", 1);

app.use(cors({
    origin: env.FRONTEND_URL,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
app.use("/api", routes);

app.use((req, res, next) => {
    next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

app.use((err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";

    const response = {
        success: false,
        message: err.isOperational ? err.message : "Something went wrong"
    };

    if (env.NODE_ENV === "development") {
        response.stack = err.stack;
        response.message = err.message;
    }

    res.status(err.statusCode).json(response);
});

export default app;
