const router = require("express").Router();

const UnitController = require("../../app/controllers/unit.controller");

router.get("/", UnitController.getAllUnit)
router.get("/:id", UnitController.getUnitById)
router.post("/", UnitController.createUnit)
router.patch("/:id", UnitController.updateUnit)
router.delete("/:id", UnitController.deleteUnit)

// export router
module.exports = router;