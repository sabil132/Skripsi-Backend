const router = require("express").Router();

const HeadUnitController = require("../../app/controllers/head.unit.controller");
const { authJWT } = require("../../app/middlewares");

router.post("/", HeadUnitController.createHeadUnit)
router.patch("/:id", HeadUnitController.updateHeadUnit)
router.delete("/:id", HeadUnitController.deleteHeadUnit)

// export router
module.exports = router;