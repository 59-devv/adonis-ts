import Env from '@ioc:Adonis/Core/Env'
import { MailConfig } from "@ioc:Adonis/Addons/Mail"

const mailConfig: MailConfig = {
    mailer: 'smtp',
    mailers: {
      smtp: {
        driver: 'smtp',
        host: Env.get('SMTP_HOST') as string,
        port: Env.get('SMTP_PORT') as unknown as string,
        auth: {
          type: 'login',
          user: Env.get('SMTP_USERNAME'),
          pass: Env.get('SMTP_PASSWORD')
        },
      },
    },
  }
  
  export default mailConfig
  