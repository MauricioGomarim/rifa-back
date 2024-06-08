const { Router } = require('express');


const usersRouter = require("./users.routes");
const rifasRouter = require("./rifa.routes");




const routes = Router();

// Inicializando o router //

// Aplicando as rotas //
routes.use("/users", usersRouter);
routes.use("/orderRifa", rifasRouter);



module.exports = routes;