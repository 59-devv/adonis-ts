import Factory from '@ioc:Adonis/Lucid/Factory'
import User from 'App/Models/User'
import Todo from '../../app/Models/Todo';
import { StatusEnum } from '../../app/Enums/StatusEnum';
import Tag from 'App/Models/Tag';

export const UserFactory = Factory
    .define(User, ({ faker }) => {
        const username = faker.lorem.word(6)
        const domain = 'gmail.com'
        return {
            email: `${username}@${domain}`,
            password: 'test1234!',
            nickname: faker.lorem.word(7)
        }
    }).build()

export const TodoFactory = Factory
    .define(Todo, ({ faker }) => {
        const status = [StatusEnum.Complete, StatusEnum.OnGoing][Math.floor(Math.random() * 2)]
        return {
            content: faker.lorem.word(6),
            status: status,
        }
    }).build()

export const TagFactory = Factory
    .define(Tag, async ({ faker }) => {
        const todoId = Math.floor(Math.random() * (await Todo.all()).length) + 1
        return {
            content: faker.lorem.word(8),
            todoId: todoId,
        }
    }).build()