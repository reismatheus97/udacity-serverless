// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'lcy9hiutng'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  domain: 'reis-matheus.auth0.com',                      // Auth0 domain
  clientId: 'k5AhWMOw0zrBRUY5RCorimdpFyRB59Uz',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
