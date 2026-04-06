import { body, query } from "express-validator";

export const sendRequestValidator = [
    body("receiverId").isMongoId().withMessage("Valid receiver ID is required"),
];

export const searchValidator = [
    query("q").trim().notEmpty().withMessage("Search query is required"),
];
