import { DateTime } from 'luxon'
import { column, ManyToMany, manyToMany } from '@ioc:Adonis/Lucid/Orm'
import AppBaseModel from './AppBaseModel'
import User from './User'
import Todo from './Todo'

export default class Tag extends AppBaseModel {

  @column({ isPrimary: true })
  public id: number

  @column()
  public userId: number

  @column()
  public todoId: number

  @column()
  public tag: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true })
  public updatedAt: DateTime

  @manyToMany(() => User)
  public todoUsers: ManyToMany<typeof User>

  @manyToMany(() => Todo)
  public todoTags: ManyToMany<typeof Todo>
}
