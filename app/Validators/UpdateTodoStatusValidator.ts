import { schema } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { StatusEnum } from 'App/Enums/StatusEnum'

export default class UpdateTodoStatusValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    status: schema.enum(Object.values(StatusEnum))
  })

  public messages = {
    'status.enum': 'OnGoing, Complete 중 하나만 입력 가능합니다.'
  }
}

