import supabase from '../supabaseClient.js';

/**
 * Middleware: Attaches the authenticated user to the request object.
 *
 * Requires:
 * - `jwtCheck` middleware to run before this (provides `req.auth.sub`)
 *
 * Behavior:
 * - Fetches user from Supabase using Auth0 ID
 * - Attaches user to `req.user`
 * - 403 if the user is not found
 * - 500 if some other server error
 */

export const attachUser = async (req, res, next) => {
    try {
        const auth0Id = req.auth.payload.sub;

        const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("auth_id", auth0Id)
        .single();

        if ( error || !user){
            return res.status(403).json({ error: "User not found "})
        }   

        req.user = user;
        next(); 

    } catch {
        return res.status(500).json({ error: "Server error" });
    }
}