import { Router } from "express";
const router = Router();
export default router;

/** import all the controllers */
import * as controller from '../controllers/appController.js'
import { registerMail } from '../controllers/mailer.js'
import Auth, { localVariables } from "../middleware/auth.js";

/** POST method */
router.route('/register').post(controller.register)
router.route('/registerMail').post(registerMail)
router.route('/authenticate').post(controller.verifyUser, (req, res) => {res.end();})
router.route('/login').post(controller.verifyUser, controller.login) // this comma means the left side is middleware

/** GET method */
router.route('/user/:username').get(controller.getUser)
router.route('/generateOTP').get(controller.verifyUser, localVariables, controller.generateOTP)
router.route('/verifyOTP').get(controller.verifyOTP)
router.route('/createResetSession').get(controller.createResetSession)

/** PUT method */
router.route('/updateUser').put(Auth, controller.updateUser)
router.route('/resetPassword').put(controller.verifyUser, controller.resetPassword)