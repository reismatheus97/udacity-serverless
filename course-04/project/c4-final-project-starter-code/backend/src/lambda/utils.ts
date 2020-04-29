import { decode } from "jsonwebtoken";

/**
 * Get a jwt token string
 * @param jwtToken jwt token string
 *
 * @returns a user id from a JWT token
 */
export function getUserId(jwtToken: string): string {
  const decodedJwt = decode(jwtToken)
  return decodedJwt.sub
}