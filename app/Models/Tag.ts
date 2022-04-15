import { DateTime } from 'luxon'
import { belongsTo, column, ManyToMany, manyToMany } from '@ioc:Adonis/Lucid/Orm'
import AppBaseModel from './AppBaseModel'
import Todo from './Todo'
import NotFoundException from 'App/Exceptions/NotFoundException'
import User from 'App/Models/User';

export default class Tag extends AppBaseModel {

    @column({ isPrimary: true })
    public id: number

    @column()
    public todoId: number

    @column()
    public tag: string

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true })
    public updatedAt: DateTime

    @manyToMany(() => Todo)
    public todos: ManyToMany<typeof Todo>

    async getUser() {
        const todo = await Todo.find(this.todoId)
        if (!todo) {
            throw new NotFoundException('Not Found')
        }

        await todo.load('user')
        return todo.user
    }
}
