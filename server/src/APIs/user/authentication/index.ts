import { Router } from 'express'
import authenticationController from './authentication.controller'
import authenticate from '../../../middlewares/authenticate'

const router = Router()

router.route('/register').post(authenticationController.register)
router.route('/registration/confirm/:token').patch(authenticationController.confirmRegistration)

router.route('/login').post(authenticationController.login)
router.route('/logout').put(authenticate, authenticationController.logout)

router.route('/refresh-token').post(authenticate, authenticationController.refreshToken)

export default router
