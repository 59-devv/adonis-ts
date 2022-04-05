import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database';

export default class UsersController {

    async list() {
        const result = Database.query().from('todos').select('*');
        return await result;
    }

    async create() {
        return 'create() called';
    }

    async read( { request }:  HttpContextContract) {
        const result = {
            url: request.url(),
            message: 'read() called'
        }
        return result;
    }

    async update() {
        return 'update() called';
    }

    async delete() {
        return 'delete() called';
    }

}
function use(arg0: string) {
    throw new Error('Function not implemented.');
}