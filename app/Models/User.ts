import { DateTime } from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'
import AppBaseModel from './AppBaseModel';
import { column, beforeSave, hasMany, HasMany, hasManyThrough, HasManyThrough, afterSave } from '@ioc:Adonis/Lucid/Orm';
import Todo from './Todo';
import Tag from './Tag';
import Event from '@ioc:Adonis/Core/Event'

export default class User extends AppBaseModel {

  @column({ isPrimary: true })
  public id: number

  @column()
  public email: string

  @column({ serializeAs: null })
  public password: string

  @column()
  public nickname: string


  @column.dateTime({ autoCreate: true, serializeAs: 'createdAt' })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: 'updatedAt' })
  public updatedAt: DateTime

  // 생성 및 저장 전, 패스워드 암호화 진행
  @beforeSave()
  public static async hashPassword (user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }

  // 생성 및 저장 후, 메일 발송 진행
  @afterSave()
  public static async sendEmail (user: User) {
      Event.emit('new:user', user)
  }

  @hasMany(() => Todo)
  public todos: HasMany<typeof Todo>

  @hasManyThrough([() => Tag, () => Todo])
  public tags: HasManyThrough<typeof Tag>
}
