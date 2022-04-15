import { DateTime } from 'luxon'
import { BelongsTo, belongsTo, column, ManyToMany, manyToMany } from '@ioc:Adonis/Lucid/Orm';
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

    @column()
    public userId: number

    @column.dateTime()
    public createdAt: DateTime

    @column.dateTime()
    public updatedAt: DateTime

    @belongsTo(() => User, {
        localKey: 'id'
    })
    public user: BelongsTo<typeof User>

    // @hasMany(() => Tag)
    // public tags: HasMany<typeof Tag>
    @manyToMany(() => Tag)
    public tags: ManyToMany<typeof Tag>
}
