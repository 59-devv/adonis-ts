import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import User from '../Models/User';
import BadRequestException from '../Exceptions/BadRequestException';

export default class GetUser {
    public async handle(ctx: HttpContextContract, next: () => Promise<void>) {
        const id = ctx.auth.user?.id

        if (!id) {
            throw new BadRequestException('Bad Request', 400)
        } 

        const user = await User.find(ctx.auth.user?.id)
        ctx.user = user

        await next()
    }
}