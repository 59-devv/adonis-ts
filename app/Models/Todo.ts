import { DateTime } from 'luxon'
import { BelongsTo, belongsTo, column, ManyToMany, manyToMany } from '@ioc:Adonis/Lucid/Orm'
import AppBaseModel from './AppBaseModel'
import User from './User'
import Tag from './Tag'

export default class Todo extends AppBaseModel {

  @column({ isPrimary: true })
  public id: number
  
  @column()
  public content: string
  
  @column()
  public status: string | null
  
  @column({ serializeAs: 'userId' })
  public userId: number

  @column.dateTime({ autoCreate: true, serializeAs: 'createdAt' })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: 'updatedAt' })
  public updatedAt: DateTime

  @belongsTo(() => User, {
    localKey: 'id'
  })
  public user: BelongsTo<typeof User>

  @manyToMany(() => Tag)
  public tags: ManyToMany<typeof Tag>
}
