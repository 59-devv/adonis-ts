import Route from '@ioc:Adonis/Core/Route'

// Index
Route.get('/', () => "Adonis!" )

// UsersController
Route.post('/login', 'UsersController.signUp')
Route.post('/register', 'UsersController.signIn')

// Router with Todo and User Middleware
Route.group(() => {

  // Todo 
  Route.get('/todo/:todoId', 'TodosController.read')
  Route.put('/todo/:todoId', 'TodosController.update')
  Route.delete('/todo/:todoId', 'TodosController.delete')
  
  // Tag
  Route.get('/todo/:todoId/tag', 'TagsController.readTodoTags')
  Route.post('/todo/:todoId/tag', 'TagsController.createTodoTag')
}).middleware('user').middleware('todo')


// Router with User Middleware
Route.group(() => {

  // Todo
  Route.get('/todo', 'TodosController.list')
  Route.post('/todo', 'TodosController.create')
  Route.post('/todo/upload', 'TodosController.upload')
  
  // User
  Route.get('/user', 'UsersController.list')
  Route.get('/profile', 'UsersController.profile')
  
  // Tag
  Route.get('/tag', 'TagsController.list')
  Route.get('/user/tag', 'TagsController.readUserTags')
  
  Route.put('/tag/:tagId', 'TagsController.update')
  Route.delete('/tag/:tagId', 'TagsController.delete')
}).middleware('auth').middleware('user')
