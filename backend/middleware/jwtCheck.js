import { auth } from "express-oauth2-jwt-bearer";

/**
 * Auth0 JWT middleware
 * 
 * Purpose: Provide attachUser with the auth0 details to find the user in our DB
 */
export const jwtCheck = auth({
    audience: process.env.AUTH0_AUDIENCE,
    issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
    tokenSigningAlg: "RS256",
});
  