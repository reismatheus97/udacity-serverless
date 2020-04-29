import * as AWS_SDK from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { getUserId } from '../utils'
import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'

const AWS = AWSXRay.captureAWS(AWS_SDK)
const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]
  const userId = getUserId(jwtToken)
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

  let statusCode: number

  let params = {
    TableName: todosTable,
    Key: {
      "userId": userId,
      "todoId": todoId
    },
    UpdateExpression: "set #x = :name, dueDate = :dueDate, done = :done",
    ExpressionAttributeValues: {
      ':name': updatedTodo.name,
      ':dueDate': updatedTodo.dueDate,
      ':done': updatedTodo.done
    },
    ExpressionAttributeNames: {
      '#x': 'name'
    }
  }

  let body: string
  try {
    await docClient.update(params).promise()
    statusCode = 201
  } catch (error) {
    body = error
    statusCode = 404
  }

  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(body)
  }
}
