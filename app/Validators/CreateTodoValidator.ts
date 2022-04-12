import { schema, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { StatusEnum } from 'App/Enums/StatusEnum'

export default class CreateTodoValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    content: schema.string ( { trim: true }, [
      rules.minLength(4),
      rules.maxLength(15),
    ]),
    status: schema.enum(Object.values(StatusEnum)),
  })

  /* 
    custom message 만들기
    'property.rule': 'message' 형식으로 표시하면, 해당 rule을 위반했을 때 메시지를 출력한다.
   */
  public messages = {
    'content.string': '{{ field }} must be a type of string.',
    'content.required': '{{ field }} is required to create a new Todo',
    'content.minLength': '{{ field }} length should over 4 letters.',
    'content.maxLength': '{{ field }} length should under 15 letters.',
    'status.enum': 'status have to be one of the Status codes.'
  }
}

  /*
   * Define schema to validate the "shape", "type", "formatting" and "integrity" of data.
   *
   * For example:
   * 1. The username must be of data type string. But then also, it should
   *    not contain special characters or numbers.
   *    ```
   *     schema.string({}, [ rules.alpha() ])
   *    ```
   *
   * 2. The email must be of data type string, formatted as a valid
   *    email. But also, not used by any other user.
   *    ```
   *     schema.string({}, [
   *       rules.email(),
   *       rules.unique({ table: 'users', column: 'email' }),
   *     ])
   *    ```
   */

  /**
   * Custom messages for validation failures. You can make use of dot notation `(.)`
   * for targeting nested fields and array expressions `(*)` for targeting all
   * children of an array. For example:
   *
   * {
   *   'profile.username.required': 'Username is required',
   *   'scores.*.number': 'Define scores as valid numbers'
   * }
   *
   */
