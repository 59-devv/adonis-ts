import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import UnAuthorizedException from '../../Exceptions/UnAuthorizedException';
import Database from '@ioc:Adonis/Lucid/Database';
import Tag from 'App/Models/Tag';
import BadRequestException from '../../Exceptions/BadRequestException';
import ForbiddenException from '../../Exceptions/ForbiddenException';
import NotFoundException from '../../Exceptions/NotFoundException';

export default class TagsController {

    // 전체 Tag 목록 보여주기
    async list() {
        return await Tag.all()
    }
    
    // Todo Tag 생성하기
    async createTodoTag({ request, response, todo, user }: HttpContextContract) {
        if (!user) {
            throw new UnAuthorizedException('UnAuthorized')
        }

        if (!todo) {
            throw new NotFoundException('Not Found')
        }

        const todoId = todo.id
        const tagName: string = request.only(['tagName']).tagName

        console.log(tagName, todoId)

        if (!tagName) {
            throw new BadRequestException('Bad Request')
        }

        const trx = await Database.transaction()
        try {
            const newTag: Tag = new Tag()
            newTag.useTransaction(trx)
            
            newTag.todoId = todoId
            newTag.tag = tagName.trim()
            
            await newTag.save()
            await newTag.related('todoTags').attach([todoId])
            await trx.commit()
            
            return response.status(201).send(newTag)

        } catch(error) {
            await trx.rollback()
            throw new BadRequestException('Bad Request')
        }
    }

    // 현재 로그인 유저의 Tag List 보여주기
    async readUserTags({ user }: HttpContextContract) {
        if (!user) {
            throw new UnAuthorizedException('UnAuthorized')
        }

        return await user.related('tags').query()
    }

    // Todo Id 받아서 Tag List 보여주기
    async readTodoTags({ user, todo }: HttpContextContract) {
        if (!user) {
            throw new UnAuthorizedException('UnAuthorized')
        }

        if (!todo) {
            throw new NotFoundException('Not Found')
        }

        await todo.load('tags')
        return todo.tags
    }

    // Tag 수정하기
    async update({ params, request, response, user }: HttpContextContract) {
        if (!user) {
            throw new UnAuthorizedException('UnAuthorized')
        }

        const userId: number = user.id
        const tagId: number = params['tagId']

        const newTagName = request.only(['newTagName']).newTagName
        
        const targetTag = await Tag.find(tagId)
        console.log(tagId, newTagName)
        if (!tagId || !newTagName) {
            throw new BadRequestException('1Bad Request')
        }
        
        if (!targetTag) {
            throw new NotFoundException('Not Found')
        }
        
        if (targetTag.userId !== userId) {
            throw new ForbiddenException('You are Forbidden')
        }

        const todo = await targetTag.related('todoTags').query().where('tag_id', tagId).first()
        if (!todo) {
            throw new NotFoundException('Not Found')
        }
        
        const trx = await Database.transaction()
        try {
            targetTag.tag = newTagName

            targetTag.useTransaction(trx)
            await targetTag.save()
            await trx.commit()

            return response.status(201).send(targetTag)

        } catch(error) {
            throw new BadRequestException('2Bad Request')
        }
    }

    // Tag 삭제
    async delete({ params, response, todo, user }: HttpContextContract) {
        if (!user) {
            throw new UnAuthorizedException('UnAuthorized')
        }

        if (!todo) {
            throw new NotFoundException('Not Found')
        }

        const userId: number = user.id

        const tagId: number = params['tagId']
        const targetTag = await Tag.find(tagId)
        if (!tagId) {
            throw new BadRequestException('Bad Request')
        }

        if (!targetTag) {
            throw new NotFoundException('Not Found')
        }

        if (targetTag.userId !== userId) {
            throw new UnAuthorizedException('UnAuthorized')
        }

        const trx = await Database.transaction()
        try {
            targetTag.useTransaction(trx)
            targetTag.related('todoTags').detach([todo.id])
            await targetTag.delete()
            await trx.commit()
            return response.status(200).send('Delete Complete')
            
        } catch(error) {
            await trx.rollback()
            throw new BadRequestException('Bad Request')
        }
    }
}
