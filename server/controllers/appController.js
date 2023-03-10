import UserModel from "../model/User.model.js"
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken"
import ENV from '../config.js'
import otpGenerator from 'otp-generator'

/** middleware for verifying user with jwt */
export async function verifyUser(req, res, next) {
    try {
        // get the username from query if it's GET request. POST or PUT request -> get from the body
        const {username} = req.method == "GET" ? req.query : req.body

        //check the user existance
        let exists = await UserModel.findOne({username})
        if (!exists) return res.status(404).send({error: "Cannot find user"})
        
        next()
    }
    catch (error) {
        return res.status(404).send({error: "Authentication error"})
    }
}

/** POST: http://localhost:8080/api/register
 * @param : {
 *  "username": "",
 *  "password": "",
 *  "email": "",
 *  "firstName": "",
 *  "lastName": "",
 *  "mobile": "",
 *  "address": "",
 *  "profile": ""
 * }
 */
export async function register(req, res) {
    
    try {
        const {username, password, email, profile} = req.body

        // check esistance of user
        const existUsername = new Promise((resolve, reject) => {
            UserModel.findOne({ username }, function(err, user) {
                if (err) { reject(new Error(err)) }
                if (user) { reject({error: "User with the same username already exists"}) }
                resolve()
            })
        })

        // check esistance of email
        const existEmail = new Promise((resolve, reject) => {
            UserModel.findOne({ email }, function(err, email) {
                if (err) { reject(new Error(err)) }
                if (email) { reject({error: "User with the same email already exists"}) }
                resolve()
            })
        })

        Promise.all([existUsername, existEmail])
            .then(() => {
                if (password) {
                    bcrypt.hash(password, 10)
                        .then(hashedPassword => {
                            const user = new UserModel({
                                username: username,
                                password: hashedPassword,
                                profile: profile || '',
                                email: email
                            })

                            //return and save 
                            user.save()
                                .then(result => res.status(201).send({ msg: "User was registered successfully." }))
                                .catch(error => res.status(500).send({ error }))
                        })
                        .catch(error => {
                            return res.status(500).send({
                                error: "Enable to hash password"
                            })
                        })
                }
            })
            .catch(error => {
                return res.status(500).send({ error })
            })
    }
    catch (error) {
        return res.status(500).send(error)
    }

}

/** POST: http://localhost:8080/api/login
 * @param : {
 *  "username": "",
 *  "password": ""
 * }
 */
export async function login(req, res) {
    const {username, password} = req.body

    try {
        UserModel.findOne({ username })
            .then(user => {
                bcrypt.compare(password, user.password)
                    .then(isPasswordCorrect => {
                        if (!isPasswordCorrect) {
                            return res.status(400).send({error: "Password doesn't exist"})
                        }

                        // jwt token
                        const token = jwt.sign({
                            userId: user._id,
                            username: user.username,
                        }, ENV.JWT_SECRET, {expiresIn: "24h"})

                        return res.status(200).send({
                            msg: "Login successful",
                            username: user.username,
                            token: token
                        })
                    })
                    .catch(error => {
                        return res.status(400).send({error: "Password doesn't match"})
                    })
            })
            .catch(error => {
                return res.status(404).send({ error: "Username not found" })
            })
    }
    catch (error) {
        return res.status(500).send({ error })
    }
}

/** GET: http://localhost:8080/api/user/taro123 */
export async function getUser(req, res) {
    const {username} = req.params;

    try {
        if (!username) {
            return res.status(501).send({error: "Invalid username"})
        }

        UserModel.findOne({username}, (error, user) => {
            if (error) return res.status(500).send({error})
            if (!user) return res.status(501).send({error: "Couldn't find user"})
            
            const {password, ...rest} = Object.assign({}, user.toJSON()) // convert the user to JSON and assign it to a new object{}

            return res.status(201).send(rest)
        })
    }
    catch (error) {
        return res.status(404).send({error: "Cannot find user data"})
    }

}

/** PUT: http://localhost:8080/api/updateuser 
 * @param : {
 *  "id": ""
 * }
 * body: {
 *  "firstName": "",
 *  "address": "",
 *  "profile": ""
 * }
*/
export async function updateUser(req, res) {
    try {
        const { userId } = req.user // req has user object that is set in Auth() (middleware/auth.js)

        if (userId) {
            const body = req.body

            console.log('firstName = ' + body.firstName)
            console.log('lastName = ' + body.lastName)

            //update the data
            UserModel.updateOne({_id: userId}, body, function(error, data) {
                if (error) throw error;

                return res.status(201).send({msg: "Record updated"})
            })
        }
        else {
            return res.status(401).send({error: "User not found"})
        }
    }
    catch(error) {
        return res.status(401).send({error})
    }
}

/** GET: http://localhost:8080/api/generateOTP */
export async function generateOTP(req, res) {
    req.app.locals.OTP = await otpGenerator.generate(
        6, {lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false}
    )
    res.status(201).send({code: req.app.locals.OTP})
}

/** GET: http://localhost:8080/api/verifyOTP */
export async function verifyOTP(req, res) {
    const { code } = req.query; // code is the code object created above in generateOTP() method

    if (parseInt(req.app.locals.OTP) === parseInt(code)) {
        req.app.locals.OTP = null; // reset the OTP value to allow access only once
        req.app.locals.resetSession = true; // set the session for reset password
        return res.status(201).send({msg: "OTP verification successful"})
    }

    return res.status(400).send({error: "Invalid OTP"})
}

// redirect user when OTP is valid. this is the session to reset password
/** GET: http://localhost:8080/api/createResetSession */
export async function createResetSession(req, res) {
    if (req.app.locals.resetSession) {
        return res.status(201).send({flag: req.app.locals.resetSession})
    }

    res.status(404).send({error: "Session expired"})
}

//update the password when a valid session is held
/** PUT: http://localhost:8080/api/resetPassword  */
export async function resetPassword(req, res) {
    console.log('resetPassword backend!!!')
    try {
        if (!req.app.locals.resetSession) {
            return res.status(404).send({error: "Session expired"})
        }

        const {username, password} = req.body

        try {
            console.log('resetPassword backend!!! inside try')
            UserModel.findOne({username})
                .then(user => {
                    bcrypt.hash(password, 10)
                        .then(hashedPassword => {
                            UserModel.updateOne(
                                {username: user.username}, // select the entry to update
                                {password: hashedPassword}, // update the password of the user
                                function(error, data) {
                                    if (error) throw error
                                    req.app.locals.resetSession = false
                                    return res.status(201).send({msg: "Record updated"})
                                }
                            )
                        })
                        .catch(error => {
                            return res.status(500).send({error: "Unable to hash password"})
                        })
                })
                .catch(error => {
                    return res.status(404).send({error: "Username not found"})
                })
        }
        catch(error) {
            return res.status(500).send({error})
        }
    }
    catch(error) {
        return res.status(401).send({error})
    }
}