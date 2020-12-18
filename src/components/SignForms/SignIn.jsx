import React from 'react';
import { motion } from 'framer-motion';
import { componentMotion } from '../../styles/motions/menu-components';
import SignField from '../inputFields/SignField';

const SignIn = ({ submitSignIn, getOnChangeVerifier, submitButton, warnings }) => (
  <motion.form { ...componentMotion } className="sign-form" onSubmit={ submitSignIn } >
    <SignField {...{ warning: warnings.email, label: 'email', type: 'email', handleOnChange: getOnChangeVerifier('email') }} />
    <SignField {...{ warning: warnings.passwd, label: 'password', type: 'password', handleOnChange: getOnChangeVerifier('passwd') }} />
    <input className="form-submit" type="submit" value="sign in" { ...submitButton } />
  </motion.form>
);

export default SignIn;
