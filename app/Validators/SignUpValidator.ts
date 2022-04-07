import { schema, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class SignUpValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    email: schema.string({ trim: true }, [
      rules.email({
        sanitize: true,
        ignoreMaxLength: true,
      }),
      rules.required(),
    ]),

    password: schema.string({}, [
      // 최소 8 자, 최소 하나의 문자 및 숫자, 특수문자를 포함해야 한다.
      rules.regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/),
      rules.required(),
    ]),
  })

  public messages = {
    'email.email': '올바른 Email 형식이 아닙니다.',
    'email.required': 'Email 주소는 필수 입력값입니다.',
    'password.regex': '비밀번호는 최소 8자로 문자와 숫자를 모두 포함해야합니다.',
    'password.required': '비밀번호는 필수 입력값입니다.',
  }
}
