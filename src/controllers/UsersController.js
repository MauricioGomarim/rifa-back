
const knex = require("../database/knex");

const AppError = require("../utils/AppError");


class UsersController {
  async create(request, response) {
    
    const { name, email, password } = request.body;

    return response.status(201).json();
  }

  async update(request, response) {
    const { name, email, password, old_password } = request.body;
    const user_id = request.user.id;
    

    return response.status(201).json();
  }
}

module.exports = UsersController;