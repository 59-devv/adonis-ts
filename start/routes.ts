import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async () => {
  return { hello: 'world' }
})

// UsersController
Route.get('/user', 'UsersController.list')

// TodosController

// UsersController
Route.post('/login', 'UsersController.signUp')
Route.post('/register', 'UsersController.signIn')

// Auth Group
Route.group(() => {
  // Todo 
  Route.get('/todos', 'TodosController.list')
  Route.get('/todos/:id', 'TodosController.read')
  Route.post('/todos', 'TodosController.create')
  Route.put('/todos/:id', 'TodosController.update')
  Route.delete('/todos/:id', 'TodosController.delete')
  Route.post('/upload', 'TodosController.upload')

  // User
  Route.get('/profile', 'UsersController.profile')
}).middleware('auth')