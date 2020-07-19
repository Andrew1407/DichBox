import React, { useState }  from 'react';
import axios from 'axios';

const SignIn = ({ setUserData, userDataInput, setUserDataInput, history }) => {
  const [correctInput, setCorrectState] = useState({
    email: false,
    passwd: false
  });
  const [warnings, setWarning] = useState({
    email: {},
    passwd: {}
  });
  const buttonStyle = correctInput.email && correctInput.passwd ?
    { borderColor: 'rgb(0, 255, 76)', color: 'rgb(0, 255, 76)' } :
    { borderColor: 'rgb(0, 217, 255)', color: 'rgb(0, 217, 255)' };
  const verifyPatterns = {
    passwd(input) {
      const result = /^.{5,16}$/.test(input);
      const passwd = result ?
        { borderColor: 'rgb(0, 255, 76)', text: '' } :
        { borderColor: 'crimson', text: 'Password length should be 5-16 symbols' };
      setWarning({ ...warnings, passwd });
      setCorrectState({ ...correctInput, passwd: result ? true : false });
    },
    async email(input) {
      let email = { borderColor: 'rgb(0, 255, 76)', text: '' };
      let btnState = true;
      const emailTemplate = /^([a-z_\d\.-]+)@([a-z\d]+)\.([a-z]{2,8})(\.[a-z]{2,8})*$/;
      if (!emailTemplate.test(input)) {
        email = {
          borderColor: 'crimson',
          text: 'Incorrect email input form' 
        };
        setWarning({ ...warnings, email });
        btnState = false;
        return;
      }
      const verifyBody = {
        inputValue: input,
        inputField: 'email'
      };
      const { data } = await axios.post('http://192.168.0.223:7041/users/verify', verifyBody);
      console.log(data)
      if (input !== data.foundValue) {
        email = { 
          borderColor: 'crimson',
          text: 'This email is not registered' 
        };
        btnState = false
      };
      setWarning({ ...warnings, email });
      setCorrectState({ ...correctInput, email: btnState });
    }
  };
  const updateUserData = field => {
    const inputVerify = verifyPatterns[field];
    return e => {
      e.preventDefault();
      const input = e.target.value;
      inputVerify(input);
      setUserDataInput({ ...userDataInput, [field]: input });
    };
  }
  const submitSignIn = async e => {
    e.preventDefault();
    const isCorrect = correctInput.email && correctInput.passwd;
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

  return (
    <form className="sign-form" onSubmit={ submitSignIn } >
      <div className="sign-field">
        <p>email:</p>
        <input type="email" onChange={ updateUserData('email') } style={{ borderBottomColor: warnings.email.borderColor }} />
        <i className="warning">{warnings.email.text}</i>
      </div>
      <div className="sign-field">
        <p>password:</p>
        <input type="password" onChange={ updateUserData('passwd') } style={{ borderBottomColor: warnings.passwd.borderColor }} />
        <i className="warning">{warnings.passwd.text}</i>
      </div>
      <input className="form-submit" type="submit" value="sign in" disabled={ !(correctInput.email && correctInput.passwd) } style={ buttonStyle } />
    </form>
  );
};

export default SignIn;
