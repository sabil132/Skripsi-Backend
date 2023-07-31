const router = require("express").Router();

const PositionController = require("../../app/controllers/position.controller");
const { authJWT } = require("../../app/middlewares");

router.get("/", authJWT, PositionController.getAllPosition)
router.get("/:id", authJWT, PositionController.getPositionById)
router.post("/", PositionController.createPosition)
router.patch("/:id", authJWT, PositionController.updatePosition)
router.delete("/:id", authJWT, PositionController.deletePosition)


// export router
module.exports = router;