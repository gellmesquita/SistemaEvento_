import { Knex } from "knex";

export async function up(knex: Knex) {
    return knex.schema.createTable('eventos', (table)=>{
        table.increments('id').primary();
        table.string('image').notNullable();
        table.string('name').notNullable();
        table.dateTime('data').notNullable();
        table.tinyint('tipo').notNullable();
        table.string('endereco').notNullable();
        table.string('estado').notNullable();
        table.integer('idEntidade').notNullable().references('id').inTable('entidades').onDelete('cascade').onUpdate('cascade');

    })
}

export async function down(knex: Knex) {
    return knex.schema.dropTable('eventos')
}

//image, name,data,tipo,endereco,estado,idEntidade