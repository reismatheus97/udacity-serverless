import 'source-map-support/register'
import * as AWS_SDK from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import uuid from 'uuid'
import { getUserId } from '../utils'

const AWS = AWSXRay.captureAWS(AWS_SDK)

const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const parsedBody = JSON.parse(event.body)
  const itemId = uuid.v4()

  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]

  const newItem = {
    todoId: itemId,
    userId: getUserId(jwtToken),
    ...parsedBody
  }

  await docClient.put({
    TableName: todosTable,
    Item: newItem
  }).promise()

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({ item: newItem })
  }
}
