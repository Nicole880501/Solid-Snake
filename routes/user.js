const router = require("express").Router();

const { signup } = require("../controllers/userController");
const { signupValidation } = require("../middleware/validation");

router.post("/signup", signupValidation, signup);

module.exports = router;
