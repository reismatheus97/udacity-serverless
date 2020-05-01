import uuid from 'uuid'
import { getUserId } from '../lambda/utils'
import { TodoAccess } from '../dataLayer/todoAccess'

const todoAccess = new TodoAccess()

export async function getTodosPerUser (jwtToken: string): Promise<any[]> {
  const userId = getUserId(jwtToken)
  return todoAccess.getTodosPerUser(userId)
}

export async function getTodo (jwtToken: string, todoId: string): Promise<any[]> {
  const userId = getUserId(jwtToken)
  return todoAccess.getTodo(userId, todoId)
}

export async function createTodo (
  todoRequest,
  jwtToken
): Promise<any> {

  const todoId = uuid.v4()
  const userId = getUserId(jwtToken)

  return await todoAccess.createTodo({
    todoId,
    userId,
    ...todoRequest
  })

}

export async function updateTodo (jwtToken: string, todo: object): Promise<any[]> {
  const userId = getUserId(jwtToken)
  return todoAccess.updateTodo(userId, todo)
}

export async function deleteTodo (jwtToken: string, todoId: string): Promise<any[]> {
  const userId = getUserId(jwtToken)
  return todoAccess.deleteTodo(userId, todoId)
}

export async function generateUploadUrl (jwtToken: string, todoId: string): Promise<string> {
  const userId = getUserId(jwtToken)
  return todoAccess.getUploadUrl(userId, todoId)
}
