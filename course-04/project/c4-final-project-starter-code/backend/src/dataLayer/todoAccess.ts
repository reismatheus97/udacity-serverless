import * as AWS_SDK from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

import { TodoItem } from '../models/TodoItem'

const AWS = AWSXRay.captureAWS(AWS_SDK)

export class TodoAccess {
  constructor (
    private readonly docClient = new AWS.DynamoDB.DocumentClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly s3Client = new AWS.S3({
      signatureVersion: 'v4'
    }),
    private readonly bucketName = process.env.IMAGES_S3_BUCKET,
    private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION
  ) {}

  async getTodosPerUser (userId: string): Promise<TodoItem[]> {
    console.log('Getting all TODOs')

    const result = await this.docClient.query({
      TableName: this.todosTable,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
      ScanIndexForward: false
    }).promise()

    return result.Items
  }

  async getTodo (userId: string, todoId: string): Promise<TodoItem[]> {
    console.log('Getting user TODOs')

    const result = await this.docClient.query({
      TableName: this.todosTable,
      KeyConditionExpression: 'userId = :userId AND todoId = :todoId',
      ExpressionAttributeValues: {
        ':userId': userId,
        ':todoId': todoId
      },
      ScanIndexForward: false
    }).promise()

    return result.Items
  }

  async createTodo (todo: TodoItem): Promise<TodoItem> {
    console.log(`Creating a TODO with id ${todo.todoId}`)

    await this.docClient.put({
      TableName: this.todosTable,
      Item: todo
    }).promise()

    return todo
  }

  async updateTodo (userId: string, updatedTodo: any): Promise<any> {
    let params = {
      TableName: this.todosTable,
      Key: {
        "userId": userId,
        "todoId": updatedTodo.todoId
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

    await this.docClient.update(params).promise()
  }

  async deleteTodo (userId: string, todoId: string): Promise<any> {
    await this.docClient.delete({
      TableName: this.todosTable,
      Key: {
        "userId": userId,
        "todoId": todoId
      }
    }).promise()
    return true
  }


  async getUploadUrl (todoId: string = '', userId: string): Promise<string> {
    let encodedUserId = encodeURIComponent(userId)
    return this.s3Client.getSignedUrl('putObject', {
      Bucket: this.bucketName,
      Key: todoId + '___' + encodedUserId,
      Expires: this.urlExpiration
    })
  }
}