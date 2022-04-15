import Factory from '@ioc:Adonis/Lucid/Factory'
import User from 'App/Models/User'
import Todo from '../../app/Models/Todo';
import { StatusEnum } from '../../app/Enums/StatusEnum';
import Tag from 'App/Models/Tag';

export const UserFactory = Factory
    .define(User, ({ faker }) => {
        const email = faker.internet.email()
        return {
            email: email,
            password: 'test1234!',
            nickname: Math.random().toString(36).substring(2, 10)
        }
    })
    .relation('todos', () => TodoFactory)
    .build()

export const TodoFactory = Factory
    .define(Todo, ({ faker }) => {
        const status = [StatusEnum.Complete, StatusEnum.OnGoing][Math.floor(Math.random() * 2)]
        return {
            content: faker.lorem.word(6),
            status: status,
        }
    })
    .relation('tags', () => TagFactory)
    .build()

export const TagFactory = Factory
    .define(Tag, async ({ faker }) => {
        return {
            tag: faker.lorem.word(8),
        }
    })
    .build()
