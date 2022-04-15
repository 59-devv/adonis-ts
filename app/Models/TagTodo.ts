import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import AppBaseModel from './AppBaseModel'

export default class TagTodo extends AppBaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public tagId: number

    @column()
    public todoId: number

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime
}
