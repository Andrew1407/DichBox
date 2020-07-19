import React, { useState, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import SignUp from './SignUp';
import SignIn from './SignIn';
import { MainContext } from '../../contexts/MainContext';
import '../../styles/sign-forms.css';

const SingForms = () => {
  const history = useHistory();
  const [userDataInput, setUserDataInput] = useState({});
  const [isSignUp, setSignModifier] = useState(true);
  const { setUserData } = useContext(MainContext);

  const handleSingForm = modifier => e => {
    e.preventDefault();
    setSignModifier(modifier);
  };

  const setBtnStateStyle = modifier => (
    modifier ? { backgroundColor: 'rgb(0, 217, 255)', color: 'black' } :
    { backgroundColor: 'black', color: 'rgb(0, 217, 255)' }
  );

  // sign forms values (for verification)
  const getInputStateDefault = value => ({
    email: value,
    name: value,
    passwd: value
  });

  const getBtnState = ({ email, name, passwd }) => (
    isSignUp ? email && name && passwd : email && passwd 
  );

  const [correctInput, setCorrectState] = useState(getInputStateDefault(false));
  const [warnings, setWarning] = useState(getInputStateDefault({}));

  const fetchInput = inputField => async inputValue => {
    const verifyBody = { inputField, inputValue };
    const { data } = await axios.post('http://192.168.0.223:7041/users/verify', verifyBody);
    return data;
  };

  const getVerifier = field => {
    const checkupParams = {
      email: {
        regExp: /^([a-z_\d\.-]+)@([a-z\d]+)\.([a-z]{2,8})(\.[a-z]{2,8})*$/,
        warningRegExp: 'Incorrect email input form',
        warningFetch: isSignUp ?
          'This email is already taken' :
          'This email is not registered',
        fetchFn: fetchInput('email')
      },
      name: {
        regExp: /^[\S]{5,20}$/,
        warningRegExp: 'Username length should be 5-16 symbols (no spaces)',
        warningFetch: 'This username is already taken',
        fetchFn: fetchInput('name')
      },
      passwd: {
        regExp: /^[\S]{5,20}$/,
        warningRegExp: 'Password length should be 5-16 symbols (no spaces)',
      }
    };

    const verifierParams = checkupParams[field];
    return async input => {
      const fetchVefifier = verifierParams.fetchFn;
      let warningStyle = {
        borderColor: 'rgb(0, 255, 76)',
        text: ''
      };
      let isCorrect = true;
      const inputRegExp = verifierParams.regExp;
      if (!inputRegExp.test(input)) {
        warningStyle = {
          borderColor: 'crimson',
          text: verifierParams.warningRegExp
        };
        isCorrect = false;
      } else if (fetchVefifier) {
        const checkupModifier = bool => isSignUp ? bool : !bool;
        const res = await fetchVefifier(input);
        const checkup = checkupModifier(input === res.foundValue);
        if (checkup) {
          warningStyle = {
            borderColor: 'crimson',
            text: verifierParams.warningFetch
          }
          isCorrect = false;
        }
      }
      setWarning({ ...warnings, [field]: warningStyle });
      setCorrectState({ ...correctInput, [field]: isCorrect });
    };
  };

  // input checkup
  const updateUserData = field => {
    const inputVerifier = getVerifier(field);
    return e => {
      e.preventDefault();
      const input = e.target.value;
      inputVerifier(input);
      setUserDataInput({ ...userDataInput, [field]: input });
    };
  };

  // submit handlers
  const submitSignUp = async e => {
    e.preventDefault();
    const isCorrect = getBtnState(correctInput);
    if (!isCorrect) return;
    const { data } = await axios.post('http://192.168.0.223:7041/users/create', userDataInput);
    setUserData(data);
    history.push('/');
  };

  const submitSignIn = async e => {
    e.preventDefault();
    const isCorrect = getBtnState(correctInput);
    if (!isCorrect) return;
    const { data } = await axios.post('http://192.168.0.223:7041/users/enter', userDataInput );
    if (data) {
      setUserData(data);
      history.push('/');
    } else {
      const passwd = {
        borderColor: 'crimson',
        text: 'Wrong password'
      };
      setWarning({ ...warnings, passwd });
      setCorrectState({ ...correctInput, passwd: false });
    }
  };

  // submit buttom
  const submitButton = {
    disabled: !getBtnState(correctInput),
    style: getBtnState(correctInput) ?
      { borderColor: 'rgb(0, 255, 76)', color: 'rgb(0, 255, 76)' } :
      { borderColor: 'rgb(0, 217, 255)', color: 'rgb(0, 217, 255)' }
  };

  return (
    <div id="sign">
      <div id="sign-switch">
        <p onClick={ handleSingForm(true) } style={ setBtnStateStyle(isSignUp) }>sing up</p>
        <p onClick={ handleSingForm(false) } style={ setBtnStateStyle(!isSignUp) }>sing in</p>
      </div>
      { isSignUp ? 
        <SignUp {...{ submitSignUp, updateUserData, submitButton, warnings }} /> :
        <SignIn {...{ submitSignIn, updateUserData, submitButton, warnings }} /> 
      }
    </div>
  );
};

export default SingForms;
