import 'source-map-support/register'
import * as AWS_SDK from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { getUserId } from '../utils'

const AWS = AWSXRay.captureAWS(AWS_SDK)
const s3 = new AWS.S3({
  signatureVersion: 'v4' // Use Sigv4 algorithm
})

const bucketName = process.env.IMAGES_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]
  const userId = getUserId(jwtToken)
  const todoId = event.pathParameters.todoId

  let url: string

  try {
    url = getUploadUrl(todoId, userId)
  } catch (error) {
    console.log(error)
    url = ''
  }

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      uploadUrl: url
    })
  }
}

function getUploadUrl (todoId: string = '', userId: string): string {
  let encodedUserId = encodeURIComponent(userId)
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: todoId + '___' + encodedUserId,
    Expires: urlExpiration
  })
}