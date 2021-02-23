import React, { useState, useContext, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import SignUp from './SignUp';
import SignIn from './SignIn';
import { UserContext } from '../../contexts/UserContext';
import { VerifiersContext } from '../../contexts/VerifiersContext';
import { MenuContext } from '../../contexts/MenuContext';
import { bouncingMotion } from '../../styles/motions/bouncing-icons';
import '../../styles/sign-forms.css';

const SingForms = () => {
  const { dispatchUsername } = useContext(UserContext);  
  const {
    useVerifiers,
    fetchUserInput,
    warnings,
    correctInput,
    dataInput,
    dispatchDataInput,
    cleanWarnings,
    setWarningsOnHandle
  } = useContext(VerifiersContext);
  const { setFoundErr } = useContext(MenuContext);
  const [isSignUp, setSignModifier] = useState(true);
  const setBtnStateStyle = modifier => (
    modifier ? { backgroundColor: 'rgb(0, 217, 255)', color: 'black' } :
    { backgroundColor: 'black', color: 'rgb(0, 217, 255)' }
  );

  const signInVerParams = {
    email: {
      regExp: /^([a-z_\d\.-]+)@([a-z\d]+)\.([a-z]{2,8})(\.[a-z]{2,8})*$/,
      warningRegExp: 'Incorrect email input form',
      warningFetch: isSignUp ?
        'This email is already taken' :
        'This email is not registered',
      fetchVerifier: async input => {
        const fetchData = fetchUserInput;
        const found = await fetchData('email', input);
        return isSignUp ? found : !found;
      }
    },
    passwd: {
      regExp: /^[\S]{5,20}$/,
      warningRegExp: 'Password length should be 5-16 symbols (no spaces)',
    }
  };
  const signUpVerParams = {
    ...signInVerParams,
    name: {
      regExp: /^[^\s/]{1,40}$/,
      warningRegExp: 'Username should be unique, 5-40 symbols length (no spaces)',
      warningFetch: 'This username is already taken',
      fetchVerifier: async input => {
        const fetchData = fetchUserInput;
        const found = await fetchData('name', input);
        return found;
      }
    }
  };
  const { getVerifiersState, getOnChangeVerifier } =
    useVerifiers(isSignUp ? signUpVerParams : signInVerParams);
  const handleSignForm = modifier => e => {
    e.preventDefault();
    dispatchDataInput({ type: 'CLEAN_DATA' });
    cleanWarnings();
    setSignModifier(modifier);
  };

  // submit handlers
  const submitSignUpClb = async e => {
    e.preventDefault();
    const isCorrect = getVerifiersState();
    if (!isCorrect) return;
    try {
      const { data } = await axios.post(`${process.env.APP_ADDR}/users/create`, dataInput);
      cleanWarnings();
      dispatchDataInput({ type: 'CLEAN_DATA' });
      dispatchUsername({ type: 'SET_NAME', value: data.name });
    } catch (e) {
      const { status, data } = e.response;
      const errType = status === 400 ? 'signUp' : 'server';
      setFoundErr([errType, data.msg]);
      cleanWarnings();
      dispatchDataInput({ type: 'CLEAN_DATA' });
    }
  };
  const submitSignUp = useCallback(submitSignUpClb, [dataInput]);
  
  const submitSignInClb = async e => {
    e.preventDefault();
    const isCorrect = getVerifiersState();
    if (!isCorrect) return;
    const setPasswdInvalid = () => {
      const passwd = {
        borderColor: 'crimson',
        text: 'Wrong password'
      };
      setWarningsOnHandle({ passwd }, { passwd: false });
    };
    try {
      const { data } = await axios.post(`${process.env.APP_ADDR}/users/enter`, dataInput );
      if (data.name) {
        cleanWarnings();
        dispatchDataInput({ type: 'CLEAN_DATA' });
        dispatchUsername({ type: 'SET_NAME', value: data.name });
      } else {
        setPasswdInvalid();
      }
    } catch (e) {
      const { status, data } = e.response;
      if (status === 400) {
        setPasswdInvalid();
      } else {
        const errType =  status === 404 ? 'signIn' : 'server';
        setFoundErr([errType, data.msg]);
        cleanWarnings();
        dispatchDataInput({ type: 'CLEAN_DATA' });
      }
    }
  };
  const submitSignIn = useCallback(
    submitSignInClb, 
    [dataInput, warnings, correctInput]
  );

  // submit buttom
  const ableSubmit = getVerifiersState();
  const submitButton = {
    disabled: !ableSubmit,
    style: ableSubmit ?
      { borderColor: 'rgb(0, 255, 76)', color: 'rgb(0, 255, 76)' } :
      { borderColor: 'rgb(0, 217, 255)', color: 'rgb(0, 217, 255)' }
  };

  return (
    <div id="sign">
      <div id="sign-switch">
        <motion.p
          { ...bouncingMotion }
          onClick={ handleSignForm(true) } style={ setBtnStateStyle(isSignUp) }
        >sign up</motion.p>
        <motion.p
          { ...bouncingMotion }
          onClick={ handleSignForm(false) } style={ setBtnStateStyle(!isSignUp) }
        >sign in</motion.p>
      </div>
      <AnimatePresence>
      { isSignUp ? 
        <SignUp {...{ submitSignUp, getOnChangeVerifier, submitButton, warnings }} /> :
        <SignIn {...{ submitSignIn, getOnChangeVerifier, submitButton, warnings }} /> 
      }
      </AnimatePresence>
    </div>
  );
};

export default SingForms;
