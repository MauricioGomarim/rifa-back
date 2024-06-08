const { Router } = require("express");
const RifasController = require("../controllers/RifasController");
const rifasController = new RifasController();

const rifasRoutes = Router();

rifasRoutes.post("/", rifasController.create);
rifasRoutes.post("/webhook", rifasController.responsePix);


module.exports = rifasRoutes;