import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from '../../Models/User';
import SignInValidator from '../../Validators/SignInValidator';
import Database from '@ioc:Adonis/Lucid/Database';
import SignUpValidator from '../../Validators/SignUpValidator';
import UnAuthorizedException from '../../Exceptions/UnAuthorizedException';

export default class UsersController {
    // 유저 목록 조회
    async list() {
        const userList = User.all()

        return userList
    }

    // 회원가입
    async signIn( { request, response }: HttpContextContract ) {
        const trx = await Database.transaction()
        
        // 유효성 검사
        const { email, password, nickname } = await request.validate(SignInValidator)
        
        try {
            // 유저 생성
            const user = new User()
            user.email = email
            user.password = password
            user.nickname = nickname
            user.useTransaction(trx)

            // 성공 시 저장, transaction 반영
            await user.save()
            await trx.commit()

            return response.status(201).send(user)

        } catch(error) {
            await trx.rollback()
            throw Error(error.message)
        }
    }

    // 로그인
    async signUp( { auth, user, request }: HttpContextContract ) {
        const { email, password } = await request.validate(SignUpValidator)
        const token = await auth.use('api').attempt(
            email, 
            password, 
            { expiresIn: '7days' }
            )
        
        return { user, token }
    }
 
    // 유저 조회(로그인 해야만 확인 가능)
    async profile( { user }: HttpContextContract ) {
        if (!user) {
            throw new UnAuthorizedException('승인되지 않은 사용자입니다.')
        }

        return {
            '메일주소': user.email,
            '닉네임': user.nickname,
            '가입일': user.createdAt
        }
    }
}