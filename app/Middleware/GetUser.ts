import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import User from '../Models/User';

export default class GetUser {
    public async handle(ctx: HttpContextContract, next: () => Promise<void>) {
        const id = ctx.auth.user?.id
        const user = await User.find(id)
        ctx.user = user

        await next()
    }
}