
// allowedRoles = [user, admin , superadmin] 
// logged in user role = 'user'

export const authorizationMiddleware = (allowedRoles) => {
    return async (req, res, next) => {
        try {
            const { role } = req.loggedInUser;
            const isRoleAllowed = allowedRoles.includes(role);
            console.log({ role, allowedRoles, isRoleAllowed });
            if (!isRoleAllowed) {
                return res.status(401).json({ message: "Unauthorized" });
            }
            next();
        } catch (error) {
            console.log("authorizationMiddleware error", error);
            return res.status(500).json({ message: "authorizationMiddleware Error", error });
        }
    }
}