import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Todo from 'App/Models/Todo';
import UnAuthorizedException from '../../Exceptions/UnAuthorizedException';
import Database from '@ioc:Adonis/Lucid/Database';
import Tag from 'App/Models/Tag';
import BadRequestException from '../../Exceptions/BadRequestException';
import ForbiddenException from '../../Exceptions/ForbiddenException';

export default class TagsController {

    // 전체 Tag 목록 보여주기
    async list() {
        return await Tag.all()
    }
    
    // User Tag 생성하기 
    async createUserTag({ auth, request, response }: HttpContextContract) {
        if (!auth.user) {
            throw new UnAuthorizedException('UnAuthorized', 401)
        }

        const userId: number = auth.user.id
        const tagName: string = request.only(['tagName']).tagName

        if (!tagName) {
            throw new BadRequestException('Bad Request', 400)
        }
        
        const trx = await Database.transaction()
        try {
            const newTag: Tag = new Tag()
            newTag.userId = userId
            newTag.tag = tagName.trim()

            newTag.useTransaction(trx)
            
            await newTag.save()
            await trx.commit()

            return response.status(201).send(newTag)

        } catch(error) {
            await trx.rollback()
            throw new BadRequestException('Bad Request', 400)
        }
    }

    // Todo Tag 생성하기
    async createTodoTag({ auth, params, request, response }: HttpContextContract) {
        if (!auth.user) {
            throw new UnAuthorizedException('UnAuthorized', 401)
        }

        const userId: number = auth.user.id
        const tagName: string = request.only(['tagName']).tagName
        const todoId = params['id']

        console.log(tagName, todoId)

        if (!tagName || !todoId) {
            throw new BadRequestException('1Bad Request', 400)
        }

        const trx = await Database.transaction()
        try {
            const newTag: Tag = new Tag()
            newTag.userId = userId
            newTag.todoId = todoId
            newTag.tag = tagName.trim()

            newTag.useTransaction(trx)
            
            await newTag.save()
            await trx.commit()

            return response.status(201).send(newTag)

        } catch(error) {
            await trx.rollback()
            throw new BadRequestException('Bad Request', 400)
        }
    }

    // 현재 로그인 유저의 Tag List 보여주기
    async readUserTags({ auth }: HttpContextContract) {
        if (!auth.user) {
            throw new UnAuthorizedException('UnAuthorized', 401)
        }

        const userId: number = auth.user.id
        return await Tag.query().where('userId', userId)
    }

    // Tag 수정하기
    async update({ auth, params, request, response }: HttpContextContract) {
        if (!auth.user) {
            throw new UnAuthorizedException('UnAuthorized', 401)
        }

        const userId: number = auth.user.id

        const tagId: number = params['tagId']
        const newTagName: string = request.only['newTagName']
        const targetTag = await Tag.find(tagId)
        if (!tagId || !newTagName || !targetTag) {
            throw new BadRequestException('Bad Request', 400)
        }

        if (targetTag.userId !== userId) {
            throw new ForbiddenException('You are Forbidden', 403)
        }

        const trx = await Database.transaction()
        try {
            targetTag.tag = newTagName

            targetTag.useTransaction(trx)
            await targetTag.save()
            await trx.commit()

            return response.status(201).send(targetTag)

        } catch(error) {
            throw new BadRequestException('Bad Request', 400)
        }
    }

    // Tag 삭제
    async delete({ auth, params, response }: HttpContextContract) {
        if (!auth.user) {
            throw new UnAuthorizedException('UnAuthorized', 401)
        }

        const userId: number = auth.user.id

        const tagId: number = params['tagId']
        const targetTag = await Tag.find(tagId)
        if (!tagId || !targetTag) {
            throw new BadRequestException('Bad Request', 400)
        }

        if (targetTag.userId !== userId) {
            throw new ForbiddenException('You are Forbidden', 403)
        }

        const trx = await Database.transaction()
        try {
            targetTag.useTransaction(trx)
            await targetTag.delete()

            await trx.commit()
            return response.status(200).send('Delete Complete')
            
        } catch(error) {
            await trx.rollback()
            throw new BadRequestException('Bad Request', 400)
        }
    }
}
