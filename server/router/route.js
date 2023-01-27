import { Router } from "express";
const router = Router();
export default router;

/** import all the controllers */
import * as controller from '../controllers/appController.js'

/** POST method */
router.route('/register').post(controller.register)
// router.route('/registerMail').post((req, res) => {})
router.route('/authenticate').post((req, res) => {res.end();})
router.route('/login').post(controller.login)

/** GET method */
router.route('/user/:username').get(controller.getUser)
router.route('/generateOTP').get(controller.generateOTP)
router.route('/verifyOTP').get(controller.verifyOTP)
router.route('/createResetSession').get(controller.createResetSession)

/** PUT method */
router.route('/updateUser').put(controller.updateUser)
router.route('/resetPassword').put(controller.resetPassword)