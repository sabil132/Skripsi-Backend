const router = require("express").Router();

const PositionController = require("../../app/controllers/position.controller");

router.get("/", PositionController.getAllPosition)
router.get("/:id", PositionController.getPositionById)
router.post("/", PositionController.createPosition)
router.patch("/:id", PositionController.updatePosition)
router.delete("/:id", PositionController.deletePosition)


// export router
module.exports = router;