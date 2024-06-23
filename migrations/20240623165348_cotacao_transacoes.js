exports.up = (knex) =>
    knex.schema.createTable("cotas_transacoes", (table) => {
      table.increments("id");
      table.text("id_transation");
      table.text("nome");
      table.text("telefone");
      table.timestamp("created_at").default(knex.fn.now());
      table.timestamp("updated_at").default(knex.fn.now());
    });
  
  exports.down = (knex) => knex.schema.dropTable("cotas_transacoes");