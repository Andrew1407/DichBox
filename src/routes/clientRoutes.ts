import * as expres from 'express';
import { signUpUser, findUser, signInUser, verifyUserInput } from '../controllers/userController';

const router: expres.Router = expres.Router();

router.post('/create', signUpUser);
router.post('/find', findUser);
router.post('/enter', signInUser);
router.post('/verify', verifyUserInput);

export default router;
