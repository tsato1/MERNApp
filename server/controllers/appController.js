import UserModel from "../model/User.model.js"
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken"
import ENV from '../config.js'

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

}

/** GET: http://localhost:8080/api/generateOTP */
export async function generateOTP(req, res) {

}

/** GET: http://localhost:8080/api/verifyOTP */
export async function verifyOTP(req, res) {

}

// redirect user when OTP is valid
/** GET: http://localhost:8080/api/createResetSession */
export async function createResetSession(req, res) {

}

//update the password when a valid session is held
/** PUT: http://localhost:8080/api/resetPassword  */
export async function resetPassword(req, res) {

}