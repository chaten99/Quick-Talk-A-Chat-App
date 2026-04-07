import { env } from "../config/env.js";
import responseHelper from "../utils/response.helper.js";
import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
    const token = req.cookies?.token;

    if (!token) {
        return responseHelper.unauthorized(res, "Authentication required");
    }

    try {
        const decoded = jwt.verify(token, env.JWT_SECRET);

        if (!decoded?.id) {
            return responseHelper.unauthorized(res, "Authentication required");
        }

        req.userId = decoded.id;
        next();
    } catch {
        return responseHelper.unauthorized(res, "Invalid or expired token");
    }
};

export const isAuth = protect;
