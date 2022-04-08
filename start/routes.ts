import Route from '@ioc:Adonis/Core/Route'
import Todo from '../app/Models/Todo';

Route.get('/', async () => {
  return { hello: 'world' }
})

// UsersController
Route.get('/user', 'UsersController.list')

// UsersController
Route.post('/login', 'UsersController.signUp')
Route.post('/register', 'UsersController.signIn')

// TagsController
Route.get('/tag', 'TagsController.list')

// Auth Group
Route.group(() => {
  // Todo 
  Route.get('/todo', 'TodosController.list')
  Route.get('/todo/:id', 'TodosController.read')
        .middleware('user')
        .middleware('todo')
  Route.post('/todo', 'TodosController.create')
  Route.put('/todo/:id', 'TodosController.update')
  Route.delete('/todo/:id', 'TodosController.delete')
  Route.post('/todo/upload', 'TodosController.upload')

  // User
  Route.get('/profile', 'UsersController.profile')

  // Tag
  Route.get('/user/tag', 'TagsController.readUserTags')
  Route.get('/todo/:id/tag', 'TagsController.readTodoTags')
  
  Route.post('/tag', 'TagsController.createUserTag')
  Route.post('/todo/:id/tag', 'TagsController.createTodoTag')
  
  Route.put('/tag', 'TagsController.update')
  Route.delete('/tag/:id', 'TagsController.delete')

}).middleware('auth')