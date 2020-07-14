import * as expres from 'express';
import { signUpUser, findUser } from '../controllers/userController';

const router: expres.Router = expres.Router();

router.post('/register', signUpUser);
router.post('/findUser', findUser);

export default router;
