import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import Todo from 'App/Models/Todo';
import BadRequestException from '../Exceptions/BadRequestException';

export default class GetTodo {
    public async handle(ctx: HttpContextContract, next: () => Promise<void>) {
        const id = ctx.params['id']

        if (!id) {
            throw new BadRequestException('Bad Request', 400)
        }
        
        const todo = await Todo.find(id)
        ctx.todo = todo
        
        await next()
    }
}