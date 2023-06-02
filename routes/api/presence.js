const router = require("express").Router();

const { upload } = require("../../app/middlewares");
const PresenceController = require("../../app/controllers/presence.controller");

router.get("/", PresenceController.getAllPresenceGroupByUserId)
router.get("/now/:userId", PresenceController.getPresenceByUserIdAndDate)
router.get("/:id", PresenceController.getPresenceById)
router.get("/:userId/:month", PresenceController.getAllPresenceByUserId)
router.post("/", upload.single('photo'), PresenceController.createPresence)
router.patch("/:id", upload.single('photo'), PresenceController.updatePresence)


// export router
module.exports = router;