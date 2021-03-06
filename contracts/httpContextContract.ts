import Todo from '../app/Models/Todo';
import User from '../app/Models/User';

declare module '@ioc:Adonis/Core/HttpContext' {

    interface HttpContextContract {
        requestData: User | null
        todo: Todo | null
        user: User | null
    }
}