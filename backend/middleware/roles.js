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

export const requireStudent = requireRole("student");
export const requireOrg = requireRole("org");
export const requireAdmin = requireRole("admin");