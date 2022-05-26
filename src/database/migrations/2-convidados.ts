import { Knex } from "knex";

export async function up(knex: Knex) {
    return knex.schema.createTable('convidados', (table)=>{
        table.increments('id').primary();
        table.string('email').notNullable();
        table.string('telefone').notNullable();
        table.string('name').notNullable();
        table.string('endereco').notNullable();
        table.tinyint('estado').notNullable();
        table.integer('idEvento').notNullable().references('id').inTable('eventos');

    })
}

export async function down(knex: Knex) {
    return knex.schema.dropTable('convidados')
}

//email,telefone,name,endereco,estado,idEvent