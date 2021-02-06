import React from 'react';
import { motion } from 'framer-motion';
import { componentMotion } from '../../styles/motions/menu-components';
import SignField from '../inputFields/SignField';

const SignUp = ({ submitSignUp, getOnChangeVerifier, submitButton, warnings }) => (
  <motion.form { ...componentMotion } data-testid="sign-up-test" className="sign-form" onSubmit={ submitSignUp } >
    <SignField {...{ warning: warnings.name, label: 'usermane', type: 'text', handleOnChange: getOnChangeVerifier('name') }} />
    <SignField {...{ warning: warnings.email, label: 'email', type: 'email', handleOnChange: getOnChangeVerifier('email') }} />
    <SignField {...{ warning: warnings.passwd, label: 'password', type: 'password', handleOnChange: getOnChangeVerifier('passwd') }} />
    <input className="form-submit" type="submit" value="create account" disabled={ submitButton.disabled } style={ submitButton.style } />
  </motion.form>
);

export default SignUp;
