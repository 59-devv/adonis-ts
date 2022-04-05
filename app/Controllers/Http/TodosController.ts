import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Todo from 'App/Models/Todo'
import Application from '@ioc:Adonis/Core/Application'
import CreateTodoValidator from 'App/Validators/CreateTodoValidator'
import FileUploadValidator from '../../Validators/FileUploadValidator';
import fs from 'fs'

export default class TodosController {
    // 전체 Todo 목록 조회
    async list() {
        return await Todo.all()
    }

    // Todo 생성
    async create( { request, response }: HttpContextContract ) {
        const validatedData = await request.validate(CreateTodoValidator)

        await Todo.create(validatedData)
        response.status(201).send('Todo successfully created.')
    }

    // id를 통한 Todo 검색
    async read( { response, params } : HttpContextContract) {
        const { id } = params
        const todo: Todo = await Todo.findOrFail(id)
        
        response.status(200).send(todo)
    }

    // id와 status를 받아서, status update
    async update( { request, response, params }: HttpContextContract ) {
        const { id } = params
        const { status } = await request.validate(CreateTodoValidator)
        const todo: Todo = await Todo.findOrFail(id)
        
        todo.status = status
        await todo.save()
        
        response.status(201).send(todo)
    }

    // id를 통한 Todo 삭제
    async delete( { request, response }: HttpContextContract ) {
        const id: number = request.param('id')
        const todo: Todo = await Todo.findOrFail(id)

        await todo.delete()

        response.status(204).send(`${id} todo successfully deleted`)
    }

    // csv 업로드를 통한 Todo 등록
    async upload( { request, response }: HttpContextContract) {
        const folderName = 'todo_files'

        const uploadedFile = await request.validate(FileUploadValidator)
        const file = uploadedFile.file

        // file validator의 extname은 왜 안먹는지 모르겠다.;
        if (file.extname !== 'csv') {
            return response.status(415).send('Extname of file should only be \'csv\'')
        }

        // response로 응답하면 왜 Possibly null이 발생하는가
        await file.move(Application.makePath(folderName))
        const string_csv: string = fs.readFileSync(`${folderName}/${file.fileName}`).toString()
        const arr: string[] = string_csv.split('\r\n')
        const [ menuName, ...todoList ] = arr

        // 첫 row가 content가 아닐 경우, 오류 발생 
        if (menuName !== 'content') {
            throw SyntaxError('The first row\'s name should only be the \'content\'')
        }
        
        todoList.forEach(async item => {
            if (item) {
                 await Todo.create( {
                    content: item
                })
            }
        })
        
        // 예외를 통과하고 Todo 모두 저장한 후,
        response.status(201).send('TodoList upload success.')
    }
}
