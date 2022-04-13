const body = [
    {
      id: 3,
      tag: 'Get Tag3',
      userId: 1,
      todoId: 1,
      createdAt: '2022-04-13T09:56:17.000+09:00',
      updatedAt: '2022-04-13T09:56:17.000+09:00'
    },
    {
      id: 1,
      tag: 'Get Tag1',
      userId: 1,
      todoId: 1,
      createdAt: '2022-04-13T09:56:17.000+09:00',
      updatedAt: '2022-04-13T09:56:17.000+09:00'
    }
]

const result = body.filter(item => item.tag === 'Get Tag3')

const rand = body[Math.floor(Math.random() * 2)]
console.log(rand)