import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from '../../Models/User';
import SignInValidator from '../../Validators/SignInValidator';

export default class UsersController {
    // 유저 목록 조회
    async list() {
        const userList = User.all()

        return userList
    }

    // 회원가입
    async signIn( { request }: HttpContextContract ) {
        const registerInfo = await request.validate(SignInValidator)
        const user = await User.create(registerInfo)

        return user
    }

    // 로그인
    async signUp( { auth, request }: HttpContextContract ) {
        const { email, password } = request.only(['email', 'password'])
        const token = await auth.use('api').attempt(email, password, {
            expiresIn: '7days'
        })
        const user = await User.findBy('email', email)

        return { user, token }
    }
 
    // 유저 조회(로그인 해야만 확인 가능)
    async profile( { auth, response }: HttpContextContract ) {
        try {
            const user = await User.findByOrFail('id', auth.user?.id)

            return {
                '메일주소': user.email,
                '닉네임': user.nickname,
                '가입일': user.createdAt
            }
        } catch(error) {
            return response.send('asdfasd')
            // return response.status(403).send('로그인이 필요한 기능입니다.')
        }
    }
}