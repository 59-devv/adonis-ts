import { schema, rules } from '@ioc:Adonis/Core/Validator';
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class SignInValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    email: schema.string({ trim: true }, [
      rules.email({
        sanitize: true,
        ignoreMaxLength: true,
      }),
      rules.unique( { table: 'users', column: 'email' } ),
      rules.required(),
    ]),

    password: schema.string({}, [
      // 최소 8 자, 최소 하나의 문자 및 숫자, 특수문자를 포함해야 한다.
      rules.regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/),
      rules.required(),
    ]),

    nickname: schema.string({ trim: true }, [
      rules.required(),
      rules.unique( { table: 'users', column: 'nickname' } ),
      rules.regex(/^[a-zA-Zㄱ-힣0-9]{2,8}$/),
      rules.minLength(2),
      rules.maxLength(8),
    ])
  })

  public messages = {
    'email.email': '올바른 Email 형식이 아닙니다.',
    'email.unique': '중복된 Email이 존재합니다.',
    'email.required': 'Email 주소는 필수 입력값입니다.',
    'password.regex': '비밀번호는 최소 8자로 문자와 숫자를 모두 포함해야합니다.',
    'password.required': '비밀번호는 필수 입력값입니다.',
    'nickname.required': '닉네임은 필수 입력값입니다.',
    'nickname.unique': '중복된 닉네임이 존재합니다.',
    'nickname.regex': '닉네임은 2자 이상, 8자 이하로 특수문자를 포함할 수 없습니다.',
    'nickname.minLength': '닉네임은 2자 이상, 8자 이하로 특수문자를 포함할 수 없습니다.',
    'nickname.maxLength': '닉네임은 2자 이상, 8자 이하로 특수문자를 포함할 수 없습니다.',
  }
}
