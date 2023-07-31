const router = require("express").Router();

const { upload } = require("../../app/middlewares");
const { employeeValidator } = require("../../app/requests");
const errorValidationHandler = require("../../app/helpers/errorValidationHandler"); 
const { authJWT } = require("../../app/middlewares");

const EmployeeController = require("../../app/controllers/employee.controller");

router.get("/", authJWT, EmployeeController.getAllEmployee);
router.get("/:id", authJWT, EmployeeController.getEmployeeById);
router.get("/unit/:id", authJWT, EmployeeController.getEmployeByUnit);
router.post("/", EmployeeController.createEmployee);
router.patch("/:id", upload.single('photo'), authJWT, EmployeeController.updateEmployee);
router.patch("/request/:id", EmployeeController.updatePhotoProfile)
router.delete("/:id", authJWT, EmployeeController.deleteEmployee);

module.exports = router;
