import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class TagUsers extends BaseSchema {
  protected tableName = 'tag_users'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('tag_id').unsigned().references('tags.id')
      table.integer('user_id').unsigned().references('users.id')

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
