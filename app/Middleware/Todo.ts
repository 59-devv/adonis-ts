import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import Todo from 'App/Models/Todo';
import BadRequestException from '../Exceptions/BadRequestException';
import NotFoundException from '../Exceptions/NotFoundException';

export default class GetTodo {
    public async handle(ctx: HttpContextContract, next: () => Promise<void>) {
        const id = ctx.params['todoId']

        if (!id) {
            throw new BadRequestException('Bad Request')
        }

        const todo = await Todo.find(id)
        if (!todo) {
            throw new NotFoundException('Todo Not Found')
        }
        ctx.todo = todo

        await next()
    }
}