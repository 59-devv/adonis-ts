import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Todo from 'App/Models/Todo'
import Application from '@ioc:Adonis/Core/Application'
import CreateTodoValidator from 'App/Validators/CreateTodoValidator'
import FileUploadValidator from '../../Validators/FileUploadValidator';
import fs from 'fs'
import User from '../../Models/User';
import UpdateTodoStatusValidator from 'App/Validators/UpdateTodoStatusValidator';

export default class TodosController {
    // 본인이 작성한 Todo 리스트 조회
    async list( { auth }: HttpContextContract ) {
        const user = await User.findByOrFail('id', auth.user?.id)

        // 연관관계를 이용해서 todo list 불러오기
        await user.load('todos')
        const todos: Todo[] = user.todos

        // 연관관계를 이용하지 않고 todo list 불러오기
        // const todoList = await Todo.query()
            // .where('user_id', user.id)
            // .orderBy('created_at', 'asc')

        return todos
    }

    // Todo 생성
    async create( { auth, request, response }: HttpContextContract ) {
        const validatedData = await request.validate(CreateTodoValidator)
        const { content, status } = validatedData;
        const user = await User.findByOrFail('id', auth.user?.id)
        const userId = user.id
        await Todo.create({
            content,
            status,
            userId
        })

        return response.status(201).send('Todo successfully created.')
    }

    // todoId를 통한 Todo 상세보기
    async read( { response, params } : HttpContextContract) {
        const { id } = params
        const todo: Todo = await Todo.findOrFail(id)
        
        return response.status(200).send(todo)
    }

    // todoId와 status를 받아서, status update
    // 단, 로그인 한 본인의 Todo만 가능
    async update( { auth, params, request, response }: HttpContextContract ) {
        const { id } = params
        const { status } = await request.validate(UpdateTodoStatusValidator)
        const todo: Todo = await Todo.findOrFail(id)

        // 연관관계를 이용해서 user 불러오기
        // await todo.load('user')
        // const user: User = todo.user
        // console.log(user)

        // 연관관계 이용하지 않고 user 불러오기
        const user: User = await User.findByOrFail('id', auth.user?.id)
        
        if (user.id !== todo.userId) {
            return response.status(403).send('본인이 작성한 Todo만 수정 가능합니다.')
        }
        
        todo.status = status
        await todo.save()
        
        return response.status(201).send(todo)
    }

    // id를 통한 Todo 삭제
    async delete( { auth, request, response }: HttpContextContract ) {
        const id: number = request.param('id')
        const todo: Todo = await Todo.findOrFail(id)

        // 연관관계를 통해 user 불러오기
        await todo.load('user')
        const userId: number = todo.user.id

        if (userId !== auth.user?.id) {
            return response.status(403).send('본인의 Todo만 삭제할 수 있습니다.')
        }

        await todo.delete()

        return response.status(204).send(`${id} todo successfully deleted`)
    }

    // csv 업로드를 통한 Todo 등록
    async upload( { auth, request, response }: HttpContextContract) {
        const uploadedFile = await request.validate(FileUploadValidator)
        const file = uploadedFile.file
        
        let userId: number
        try {
            const user: User = await User.findByOrFail('id', auth.user?.id)
            userId = user.id
        } catch {
            userId = 0
        }
        
        // file validator의 extname은 왜 안먹는지 모르겠다.;
        if (file.extname !== 'csv') {
            return response.status(415).send('Extname of file should only be \'csv\'')
        }
        
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
        
        // 예외를 모두 통과했을 경우 모든 Todo 저장하기
        todoList.forEach(async item => {
            if (item) {
                 await Todo.create({
                    content: item
                })
            }
        })
        
        // Success
        return response.status(201).send('TodoList upload success.')
    }
}
