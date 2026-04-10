/**
 * 
 * Middleware: Functions to allow route access based on user role in DB
 * 
 */

const requireRole = (role) => {
    return (req, res, next) => {

        if (!req.user || req.user.role !== role){
            return res.status(403).json({ error: "Insufficient Permissions"})
        }

        next(); 
    }
}

/**
 * Verifies that the user is a Student
 * 
 * Requires:
 * - `attachUser` middleware to run before this (provides `req.user`)
 * 
 */
export const requireStudent = requireRole("student");

/**
 * Verifies that the user is an organization
 * 
 * Requires:
 * - `attachUser` middleware to run before this (provides `req.user`)
 * 
 */
export const requireOrg = requireRole("org");

/**
 * Verifies that the user is an Admin
 * 
 * Requires:
 * - `attachUser` middleware to run before this (provides `req.user`)
 * 
 */
export const requireAdmin = requireRole("admin");