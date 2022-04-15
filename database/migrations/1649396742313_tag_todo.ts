import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class TagTodos extends BaseSchema {
    protected tableName = 'tag_todo'

    public async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id')
            table.integer('tag_id').unsigned().references('tags.id').onDelete('CASCADE')
            table.integer('todo_id').unsigned().references('todos.id').onDelete('CASCADE')
            /**
             * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
             */
            table.timestamp('created_at', { useTz: true })
        })
    }

    public async down() {
        this.schema.dropTable(this.tableName)
    }
}
