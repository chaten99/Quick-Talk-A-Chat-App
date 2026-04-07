import { body } from "express-validator";

export const updateProfileValidator = [
    body("username")
        .trim()
        .isLength({ min: 3, max: 30 })
        .withMessage("Username must be between 3 and 30 characters"),
];
