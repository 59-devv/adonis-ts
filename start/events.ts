/*
|--------------------------------------------------------------------------
| Preloaded File
|--------------------------------------------------------------------------
|
| Any code written inside this file will be executed during the application
| boot.
|
*/
import Event from '@ioc:Adonis/Core/Event'
import User from 'App/Models/User'
import Mail from '@ioc:Adonis/Addons/Mail';

// 유저가 회원가입 했을 때, Welcome E-mail 발송하기
Event.on('new:user', async (user: User) => {
    await Mail.use('smtp').send((message) => {
        message
        .from('nine.test.mail@gmail.com')
        // .to(user.email)  // 이걸로 보내야하지만, 실제 메일 주소가 들어오지 않을거니까 우선 주석처리
        .to('ghoh@mediance.co.kr')
        .subject(`Welcome Onboard, ${user.nickname}!`)
        .text(`Welcome ${user.nickname}!`)
      }, {
        oTags: ['signup'],
      })
})