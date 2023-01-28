import jwt from "jsonwebtoken";
import ENV from '../config.js'

/** auth middleware */
export default async function Auth(req, res, next) {
    try {
        // access the auth header to validate request
        const token = req.headers.authorization.split(" ")[1]; // take the bearer token after the space

        // retrieve the user details (decodedToken is userId)
        const decodedToken = await jwt.verify(token, ENV.JWT_SECRET)

        // set the user object in req
        req.user = decodedToken

        next()
    }
    catch (error) {
        res.status(401).json({error: "Authentication failed"})
    }
}

export function localVariables(req, res, next) {
    req.app.locals = {
        OTP: null,
        resetSession: false // will be used in appController.js verifyOTP()
    }

    next()
}