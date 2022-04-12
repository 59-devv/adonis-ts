import { DateTime } from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'
import AppBaseModel from './AppBaseModel';
import { column, beforeSave, hasMany, HasMany, hasManyThrough, HasManyThrough, afterSave } from '@ioc:Adonis/Lucid/Orm';
import Todo from './Todo';
import Tag from './Tag';
import Mail from '@ioc:Adonis/Addons/Mail';
import Env from '@ioc:Adonis/Core/Env';

export default class User extends AppBaseModel {

  @column({ isPrimary: true })
  public id: number

  @column()
  public email: string

  @column({ serializeAs: null })
  public password: string

  @column()
  public nickname: string

  @column({ serializeAs: 'rememberMeToken' })
  public rememberMeToken?: string

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
      await Mail.use('smtp').send((message) => {
        message
        .from('nine.test.mail@gmail.com')
        .to('ghoh@mediance.co.kr')
        .subject(`Welcome Onboard, ${user.nickname}!`)
        .text(`Welcome ${user.nickname}!`)
      }, {
        oTags: ['signup'],
      })
  }

  @hasMany(() => Todo)
  public todos: HasMany<typeof Todo>

  @hasManyThrough([() => Tag, () => Todo])
  public tags: HasManyThrough<typeof Tag>
}
