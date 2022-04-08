import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import Todo from 'App/Models/Todo';

export default class GetTodo {
    public async handle(ctx: HttpContextContract, next: () => Promise<void>) {
        const { id } = ctx.params['id']

        const todo = await Todo.find(id)
        ctx.todo = todo
        
        await next()
    }
}