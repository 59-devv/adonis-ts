import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import BadRequestException from 'App/Exceptions/BadRequestException'
import Todo from 'App/Models/Todo'
import User from 'App/Models/User'

export default class todo {
  public async handle(ctx: HttpContextContract, next: () => Promise<void>) {
      const id = ctx.params['todoId']

      if (!id) {
          throw new BadRequestException('Bad Request', 400)
      }
      
      const todo = await Todo.find(id)
      ctx.todo = todo

      await next()
  }
}

export class user {
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

// module.exports = {
  
//   todo: async function(ctx: HttpContextContract, next: () => Promise<void>) {
//       const id = ctx.params['todoId']

//       if (!id) {
//           throw new BadRequestException('Bad Request', 400)
//       }
      
//       const todo = await Todo.find(id)
//       ctx.todo = todo
      
//       await next()
//   },

//   user: async function(ctx: HttpContextContract, next: () => Promise<void>) {
//     const id = ctx.auth.user?.id

//     if (!id) {
//         throw new BadRequestException('Bad Request', 400)
//     } 

//     const user = await User.find(ctx.auth.user?.id)
//     ctx.user = user

//     await next()
//   }
// }
