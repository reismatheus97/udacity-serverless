import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { getUserId } from '../utils'

const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]
  const userId = getUserId(jwtToken)
  const todoId = event.pathParameters.todoId
  let statusCode, body = ''

  try {
    await docClient.delete({
      TableName: todosTable,
      Key: {
        "userId": userId,
        "todoId": todoId
      }
    }).promise()
    statusCode = 200
  } catch (error) {
    console.log(error)
    statusCode = 404
    body = error
  }

  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body
  }
}
