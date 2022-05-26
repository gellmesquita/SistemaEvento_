import { Knex } from "knex";

export async function up(knex: Knex) {
    return knex.schema.createTable('entidades', (table)=>{
        table.increments('id').primary();
        table.string('image').notNullable();
        table.string('name').notNullable();
        table.string('username').notNullable();
        table.string('email').notNullable();
        table.string('telefone').notNullable();
        table.tinyint('role').notNullable();
        table.string('senha').notNullable();
        table.string('nif').notNullable();
        table.string('endereco').notNullable();
        table.string('empresa').notNullable();
        table.decimal('estado').notNullable();

    })
}

export async function down(knex: Knex) {
    return knex.schema.dropTable('entidades')
}

//image,name,username,email,telefone,role,senha,nif,endereco,estado, empresa