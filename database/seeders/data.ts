import BaseSeeder from '@ioc:Adonis/Lucid/Seeder';
import { UserFactory } from 'Database/factories';
import { TodoFactory, TagFactory } from '../factories/index';
import Tag from 'App/Models/Tag';
export default class UserSeeder extends BaseSeeder {

    public async run() {
        const users = await UserFactory.createMany(10)
        try {
            for (const user of users) {
                const todos = await TodoFactory.merge({ userId: user.id }).createMany(2)

                for (const todo of todos) {
                    const tags: Tag[] = await TagFactory.merge({ todoId: todo.id }).createMany(2)
                    for (const tag of tags) {
                        await tag.related('todos').attach([todo.id])
                    }
                }
            }
        } catch (e) {
            throw (e)
        }
    }

    /*
        Tag에 todoId가 들어가지 않음
        Many to Many의 경우 아래와 같이 seeder를 생성하면 위 문제가 있는 것으로 보임
        (hasMany로 바꿔서 확인했을 경우에는 동일한 코드로도 todoId가 정상적으로 들어감)
    */
    // public async run() {
    // await UserFactory.with('todos', 2, (todo) => todo.with('tags', 2)).createMany(10)
    // }
}
