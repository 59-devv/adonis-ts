import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from '../../Models/User';
import SignInValidator from '../../Validators/SignInValidator';

export default class UsersController {
    // 회원가입
    async signIn( { request }: HttpContextContract ) {
        
        /*
         email, password, nickname - validator 추가해야함
        */

        const registerInfo = await request.validate(SignInValidator)
        const user = await User.create(registerInfo)
        console.log(user)
        return user
    }

    // 로그인
    async signUp( { auth, request, response }: HttpContextContract ) {
        const { email, password } = request.only(['email', 'password'])
        const token = await auth.use('api').attempt(email, password, {
            expiresIn: '7days'
        })
        const user = await User.findBy('email', email)
        return { user, token }
    }

    // 유저 조회(로그인 해야만 확인 가능)
    async profile( { auth }: HttpContextContract ) {
        try {
            const user = auth.user
            return {
                '메일주소': user?.email,
                '닉네임': user?.nickname,
                '가입일': user?.createdAt
            }
        } catch(error) {
            console.log(error)
        }
    }
}