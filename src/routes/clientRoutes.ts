import * as expres from 'express';
import { signUpUser, findUser, signInUser, verifyUserInput, getUsername } from '../controllers/userController';

const router: expres.Router = expres.Router();

router.post('/create', signUpUser);
router.post('/find', findUser);
router.post('/enter', signInUser);
router.post('/verify', verifyUserInput);
router.post('/name', getUsername)

export default router;
