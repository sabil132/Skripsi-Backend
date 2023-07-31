const router = require("express").Router();

const { upload } = require("../../app/middlewares");
const { authValidator } = require("../../app/requests");
const { authJWT } = require("../../app/middlewares");
const errorValidationHandler = require("../../app/helpers/errorValidationHandler"); 

const AuthController = require("../../app/controllers/auth.controller");
const RecognitionController = require("../../app/controllers/recognition.controller");

router.post("/login", authValidator.loginValidator, errorValidationHandler, AuthController.login);

router.post("/recognition/:id", upload.single('photo'), RecognitionController.faceMatcher);

router.patch("/activate/:token", AuthController.activation);

router.post("/forgot-password", AuthController.requestForgotPassword);

router.patch("/forgot-password/:token", AuthController.forgotPassword);

module.exports = router;
