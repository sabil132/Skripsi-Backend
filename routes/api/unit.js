const router = require("express").Router();

const UnitController = require("../../app/controllers/unit.controller");
const { authJWT } = require("../../app/middlewares");

router.get("/", authJWT, UnitController.getAllUnit)
router.get("/:id", authJWT, UnitController.getUnitById)
router.post("/", UnitController.createUnit)
router.patch("/:id", authJWT, UnitController.updateUnit)
router.delete("/:id", authJWT, UnitController.deleteUnit)

// export router
module.exports = router;