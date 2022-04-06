import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import Todo from '../../app/Models/Todo'

export default class UsersSchema extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('email', 255).notNullable()
      table.string('password', 180).notNullable()
      table.string('nickname', 50).notNullable()
      table.string('remember_me_token').nullable()

      /**
       * Uses timestampz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }

  @hasMany(() => Todo, {
    foreignKey: 'userId',
  })
  public todo: HasMany<typeof Todo>
}
