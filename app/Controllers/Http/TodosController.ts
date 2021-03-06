import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Todo from 'App/Models/Todo'
import Application from '@ioc:Adonis/Core/Application'
import CreateTodoValidator from 'App/Validators/CreateTodoValidator'
import FileUploadValidator from '../../Validators/FileUploadValidator';
import fs from 'fs'
import UpdateTodoStatusValidator from 'App/Validators/UpdateTodoStatusValidator';
import Database from '@ioc:Adonis/Lucid/Database';
import BadRequestException from '../../Exceptions/BadRequestException';
import UnsupportedMediaTypeException from '../../Exceptions/UnsupportedMediaTypeException';
import UnAuthorizedException from '../../Exceptions/UnAuthorizedException';
import ForbiddenException from '../../Exceptions/ForbiddenException';
import NotFoundException from '../../Exceptions/NotFoundException';

export default class TodosController {
    // 본인이 작성한 Todo 리스트 조회
    async list({ user }: HttpContextContract) {
        if (!user) {
            throw new UnAuthorizedException('승인되지 않은 사용자입니다.')
        }

        await user.load('todos')
        return user.todos
    }

    // Todo 생성
    async create({ request, response, user }: HttpContextContract) {
        const trx = await Database.transaction()

        const validatedData = await request.validate(CreateTodoValidator)
        const { content, status } = validatedData;

        if (!user) {
            throw new UnAuthorizedException('승인되지 않은 사용자입니다.')
        }

        try {
            // New Todo
            const newTodo = new Todo()
            const data = {
                content: content,
                status: status,
                userId: user.id
            }

            // Fill data
            newTodo.fill(data)
            newTodo.useTransaction(trx)

            await newTodo.save()

            // Transaction 검증용으로 Error 던져봄
            // throw Error('what')

            await trx.commit()
            return response.status(201).send(newTodo)

        } catch (error) {
            await trx.rollback()
            throw new Error(error.message)
        }
    }

    // todoId를 통한 Todo 상세보기
    async read({ response, todo, user }: HttpContextContract) {
        if (!user) {
            throw new UnAuthorizedException('승인되지 않은 사용자입니다.')
        }

        if (!todo) {
            throw new BadRequestException('잘못된 요청입니다.')
        }

        return response.status(200).send(todo)
    }

    // todoId와 status를 받아서, status update
    // 로그인 한 본인의 Todo만 가능
    async update({ request, response, todo, user }: HttpContextContract) {
        const trx = await Database.transaction()

        const { status } = await request.validate(UpdateTodoStatusValidator)

        if (!todo) {
            throw new BadRequestException('잘못된 요청입니다.')
            // return response.status(400).send('BAD REQUEST')
        }

        if (!user) {
            throw new UnAuthorizedException('승인되지 않은 사용자입니다.')
        }

        // 본인이 작성한 todo가 아닐 때
        if (user.id !== todo.userId) {
            throw new ForbiddenException('본인의 Todo만 수정 가능합니다.')
            // return response.status(403).send('본인이 작성한 Todo만 수정 가능합니다.')
        }

        try {
            todo.status = status
            todo.useTransaction(trx)
            await todo.save()
            await trx.commit()

            return response.status(201).send(todo)

        } catch (error) {
            await trx.rollback()
            throw new Error(error.message)
        }
    }

    // id를 통한 Todo 삭제
    async delete({ response, todo, user }: HttpContextContract) {
        const trx = await Database.transaction()

        if (!user) {
            throw new UnAuthorizedException('승인되지 않은 사용자입니다.')
        }

        if (!todo) {
            throw new NotFoundException('Todo Not Found')
        }

        if (todo.userId !== user.id) {
            throw new ForbiddenException('본인의 Todo만 삭제 가능합니다.')
        }

        try {
            todo.useTransaction(trx)
            await todo.delete()
            await trx.commit()

            return response.status(200).send('todo successfully Deleted')

        } catch (error) {
            await trx.rollback()
            throw new Error(error.message)
        }
    }

    // csv 업로드를 통한 Todo 등록
    async upload({ request, response, user }: HttpContextContract) {
        if (!user) {
            throw new UnAuthorizedException('승인되지 않은 사용자입니다.')
        }

        const userId = user.id
        const trx = await Database.transaction()

        const uploadedFile = await request.validate(FileUploadValidator)
        const file = uploadedFile.file

        // file validator의 extname은 왜 안먹는지 모르겠다.
        if (file.extname !== 'csv') {
            throw new UnsupportedMediaTypeException('확장자가 CSV인 파일만 업로드 가능합니다.')
        }

        try {
            // folder 이름을 지정해서, 폴더를 생성한 후 업로드 된 파일을 저장한다.
            const folderName = 'todo_files'
            await file.move(Application.makePath(folderName))

            // 파일을 읽고 string 형태로 변환한 후, 줄바꿈 기준으로 데이터를 배열로 생성
            const string_csv: string = fs.readFileSync(`${folderName}/${file.fileName}`).toString()
            const arr: string[] = string_csv.split('\r\n')
            const [menuName, ...todoList] = arr

            // 첫 row가 content가 아닐 경우, 오류 발생 
            if (menuName !== 'content') {
                throw new BadRequestException('잘못 작성된 파일입니다.')
            }

            /*
                파일 읽고 쓰는 과정을 비동기로 처리하기 위해
                map과 promise.all() 을 사용하였음
                (처리시간 단축 : 700ms -> 200ms)
            */
            console.time('calculatingTime')

            const todoListPromise = todoList.map(async (item) => {
                if (item.trim()) {
                    let todo: Todo = new Todo()
                    todo = todo.fill({
                        content: item.trim(),
                        userId: userId
                    })
                    todo.useTransaction(trx)
                    await todo.save()
                }
            })

            await Promise.all(todoListPromise)
            console.timeEnd('calculatingTime')


            await trx.commit()
            return response.status(201).send('TodoList upload success.')

        } catch (error) {
            await trx.rollback()
            throw new BadRequestException('잘못된 요청입니다.')
        }
    }
}
