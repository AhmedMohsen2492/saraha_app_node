import jwt from 'jsonwebtoken'
import BlackListTokens from '../db/models/blackListTokens.model.js';
import User from '../db/models/user.model.js';

export const authenticationMiddleware = () => {
    return async (req, res, next) => {
        const { accesstoken } = req.headers;
        if (!accesstoken) {
            return res.status(400).json({ message: "Please Login first" });
        }
        // verify token 
        const decodedToken = jwt.verify(accesstoken, process.env.JWT_SECRET_LOGIN);

        //check if token blacklisted (logout)
        const isTokenBlackListed = await BlackListTokens.findOne({ tokenId: decodedToken.jti });
        if (isTokenBlackListed) {
            return res.status(401).json({ message: "Token Expired , please login again" });
        }

        // get data from database 
        const user = await User.findById(decodedToken._id, '-password -__v');
        if (!user) {
            return res.status(401).json({ message: "Please SignUp" });
        }
        // add auth user in request 
        req.loggedInUser = { ...user._doc, token: { tokenId: decodedToken.jti, expiryDate: decodedToken.exp } };
        next();
    }
}