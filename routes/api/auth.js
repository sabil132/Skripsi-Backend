const router = require("express").Router();

const { upload } = require("../../app/middlewares");
const { authValidator } = require("../../app/requests");
const errorValidationHandler = require("../../app/helpers/errorValidationHandler"); 

const AuthController = require("../../app/controllers/auth.controller");
const RecognitionController = require("../../app/controllers/recognition.controller");

router.post("/login", authValidator.loginValidator, errorValidationHandler, AuthController.login);

router.post("/recognition/:id", upload.single('photo'), RecognitionController.faceMatcher);

router.patch("/activate/:token", upload.single("photo") ,AuthController.activation);

module.exports = router;
