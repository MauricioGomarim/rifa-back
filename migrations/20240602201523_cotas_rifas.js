exports.up = (knex) =>
    knex.schema.createTable("cotas_rifas", (table) => {
      table.increments("id");
      table.text("numero");
      table.text("nome");
      table.text("email");
      table.text("celular");
      table.text("cpf");
  
      table.timestamp("created_at").default(knex.fn.now());
      table.timestamp("updated_at").default(knex.fn.now());
    });
  
  exports.down = (knex) => knex.schema.dropTable("cotas_rifas");