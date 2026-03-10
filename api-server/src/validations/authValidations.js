import { body } from "express-validator";

const loginValidation = [
  body("username").trim().notEmpty().withMessage("Username is required").escape(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ max: 128 })
    .withMessage("Password too long")
];

export default { loginValidation };
export { loginValidation };
