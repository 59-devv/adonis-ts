/*
|--------------------------------------------------------------------------
| Http Exception Handler
|--------------------------------------------------------------------------
|
| AdonisJs will forward all exceptions occurred during an HTTP request to
| the following class. You can learn more about exception handling by
| reading docs.
|
| The exception handler extends a base `HttpExceptionHandler` which is not
| mandatory, however it can do lot of heavy lifting to handle the errors
| properly.
|
*/

import Logger from '@ioc:Adonis/Core/Logger'
import HttpExceptionHandler from '@ioc:Adonis/Core/HttpExceptionHandler'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { Exception } from '@poppinss/utils/build/src/Exception';

export default class ExceptionHandler extends HttpExceptionHandler {
    constructor() {
        super(Logger)
    }

    public async handle(error: Exception, ctx: HttpContextContract) {
        // Auth에서 발생하는 UNAUTHORIZED 에러 Custom
        if (error.code === 'E_UNAUTHORIZED_ACCESS') {
            return ctx.response.status(error.status).send({
                code: 'UNAUTHORIZED',
                message: 'You are Unauthorized.',
                status: 401
            })
        } else if (error.code === 'E_ROUTE_NOT_FOUND') {
            return ctx.response.status(error.status).send({
                code: 'Not Found',
                message: 'Undefined URL',
                status: 404,
            })
        }

        return super.handle(error, ctx)
    }
}
