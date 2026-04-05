import { env } from "../config/env.js";
import responseHelper from "../utils/response.helper.js";
import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
    
    const token = req.cookies?.token;
    if(!token) {
        return responseHelper.unauthorized(res, "Authentication required");
    }
    try {
        const userId = jwt.verify(token, env.JWT_SECRET);
        if(!userId) {
            return responseHelper.unauthorized(res, "Autentication required");
        }
        req.userId = userId.id;
        // console.log("Request recieved: ", req.userId);
        next();
    } catch (error) {
        return responseHelper.error(res, "Internal server error", 500);
    }
}