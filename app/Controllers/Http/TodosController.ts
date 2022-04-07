import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Todo from 'App/Models/Todo'
import Application from '@ioc:Adonis/Core/Application'
import CreateTodoValidator from 'App/Validators/CreateTodoValidator'
import FileUploadValidator from '../../Validators/FileUploadValidator';
import fs from 'fs'
import UpdateTodoStatusValidator from 'App/Validators/UpdateTodoStatusValidator';
import Database from '@ioc:Adonis/Lucid/Database';
import User from 'App/Models/User';

export default class TodosController {
    // 본인이 작성한 Todo 리스트 조회
    async list( { auth, response }: HttpContextContract ) {
        if (!auth.user) {
            return response.status(401).send('Unauthorized')   
        } 
        
        const user = await User.query().preload('todos').where('id', auth.user.id).first()

        if (user) {
            return user.todos
        } else {
            return response.status(401).send('Unauthorized')
        }

        
    }

    // Todo 생성
    async create( { auth, request, response }: HttpContextContract ) {
        const trx = await Database.transaction()

        const validatedData = await request.validate(CreateTodoValidator)
        const { content, status } = validatedData;

        if (!auth.user) {
            return response.status(401).send('Unauthorized')
        }
        
        try {
            const user = auth.user
        
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

        } catch(error) {
            await trx.rollback()
            return response.send(error.message)
        }
    }

    // todoId를 통한 Todo 상세보기
    async read( { response, params } : HttpContextContract) {
        const { id } = params
        const todo = await Todo.find(id)

        if (!todo) {
            return response.status(400).send('BAD REQUEST')
        }
        
        return response.status(200).send(todo)
    }

    // todoId와 status를 받아서, status update
    // 로그인 한 본인의 Todo만 가능
    async update( { auth, params, request, response }: HttpContextContract ) {
        const trx = await Database.transaction()

        const { id } = params
        const { status } = await request.validate(UpdateTodoStatusValidator)
        const todo = await Todo.query().preload('user').where('id', id).first()
        
        // id에 해당하는 todo가 없을 때
        if (!todo) {
            return response.status(400).send('BAD REQUEST')
        }

        // auth.user 가 존재하지 않을 때
        if (!auth.user) {
            return response.status(401).send('Unauthorized')
        }

        // 본인이 작성한 todo가 아닐 때
        if (auth.user.id !== todo.userId) {
            return response.status(403).send('본인이 작성한 Todo만 수정 가능합니다.')
        }

        try {
            todo.status = status
            todo.useTransaction(trx)
            await todo.save()
            await trx.commit()

            return response.status(201).send(todo)

        } catch (error) {
            await trx.rollback()
            return response.send(error.message)
        }
    }

    // id를 통한 Todo 삭제
    async delete( { auth, request, response }: HttpContextContract ) {
        const trx = await Database.transaction()

        try {
            const id: number = request.param('id')
            const [ todo ] = await Todo.query().preload('user').where('id', id)

            if (todo.user.id !== auth.user?.id) {
                return response.status(403).send('본인의 Todo만 삭제할 수 있습니다.')
            }

            todo.useTransaction(trx)
            await todo.delete()
            await trx.commit()

            return response.status(204).send(`todo:${id}, successfully deleted`)

        } catch(error) {
            await trx.rollback()
            return response.status(400).send('BAD REQUEST')
        }
    }

    // csv 업로드를 통한 Todo 등록
    async upload( { auth, request, response }: HttpContextContract) {

        if (!auth.user) {
            return response.status(401).send('Unauthorized')
        }   

        const userId = auth.user?.id
        const trx = await Database.transaction()

        const uploadedFile = await request.validate(FileUploadValidator)
        const file = uploadedFile.file

        // file validator의 extname은 왜 안먹는지 모르겠다.
        if (file.extname !== 'csv') {
            return response.status(415).send('Extname of file should only be \'csv\'')
        }

        try {
            // folder 이름을 지정해서, 폴더를 생성한 후 업로드 된 파일을 저장한다.
            const folderName = 'todo_files'
            await file.move(Application.makePath(folderName))

            // 파일을 읽고 string 형태로 변환한 후, 줄바꿈 기준으로 데이터를 배열로 생성
            const string_csv: string = fs.readFileSync(`${folderName}/${file.fileName}`).toString()
            const arr: string[] = string_csv.split('\r\n')
            const [ menuName, ...todoList ] = arr

            // 첫 row가 content가 아닐 경우, 오류 발생 
            if (menuName !== 'content') {
                throw SyntaxError('The first row\'s name should only be the \'content\'')
            }
            
            // TODO: 확인해봐야함
            // for (const item of todoList) {
                //     if (item) {
                    //         console.log(item)
                    //         todo = todo.fill({ content: item.trim(), userId: userId })
                    //         console.log(`asdfasdfasdfad: ${todo.content}`)
                    //         // todo.useTransaction(trx)
                    //         await todo.save()
                    //     }
                    // }
                    
            console.log(`todo list: ${todoList}`)
            todoList.forEach(async (item) => {
                if (item.trim()) {
                    let todo: Todo = new Todo()
                    console.log(item)
                    todo = todo.fill({ content: item.trim(), userId: userId })
                    console.log(`content: ${todo.content}`)
                    await todo.save()
                    todo.useTransaction(trx)
                }
            });
            
            await trx.commit()
            return response.status(201).send('TodoList upload success.')

        } catch(error) {
            await trx.rollback()
            console.log(error)
            return response.status(400).send(error.message)
        }
    }
}
