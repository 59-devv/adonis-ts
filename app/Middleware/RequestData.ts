import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import BadRequestException from 'App/Exceptions/BadRequestException'
import NotFoundException from 'App/Exceptions/NotFoundException'
import Todo from 'App/Models/Todo'
import User from 'App/Models/User'

export default class RequestData {
    public async handle(ctx: HttpContextContract, next: () => Promise<void>) {
        const id = ctx.auth.user?.id

        if (!id) {
            throw new BadRequestException('Bad Request', 400)
        }

        const user = await User.find(ctx.auth.user?.id)
        ctx.requestData = user

        await next()
        // if (userId && todoId) {
        //     ctx.requestData = {
        //         todo: todo,
        //         user: user,
        //     }
        // } else if (userId && !todoId) {
        //     ctx.requestData = {
        //         user: user,
        //     }
        // } else if (!userId && todoId) {
        //     ctx.requestData = {
        //         todo: todo
        //     }
        // }
    }
}