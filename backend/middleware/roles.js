/**
 * 
 * Middleware: Functions to allow route access based on user role in DB
 * 
 */

export const requireStudent = async (req, res, next) => {
    if (req.user.role !== "student"){
        return res.status(403).json({ error: "User is not a student"});
    }

    next();
}

export const requireOrg = async (req, res, next) => {
    if (req.user.role !== "org"){
        return res.status(403).json({ error: "User is not an organization"})
    }

    next();
}

export const requireAdmin = async (req, res, next) => {
    if (req.user.role !== "admin"){
        return res.status(403).json({ error: "User is not an admin"})
    }

    next();
}