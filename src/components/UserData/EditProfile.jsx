import React, { useState, useContext, useEffect } from 'react';
import { VerifiersContext } from '../../contexts/VerifiersContext';
import { MainContext } from '../../contexts/MainContext';
import logoDefault from '../../styles/imgs/default-user-logo.png';
import '../../styles/edit-profile.css';

const EditProfile = () => {
  const [checkedRadio, setCheckedRadio] = useState(true);
  const { userData } = useContext(MainContext);
  const { useVerifiers, fetchInput, warnings, setWarning, correctInput, setCorrectState, userDataInput, setUserDataInput } 
    = useContext(VerifiersContext);
  const signVerParams = {
    email: {
      regExp: /^([a-z_\d\.-]+)@([a-z\d]+)\.([a-z]{2,8})(\.[a-z]{2,8})*$/,
      warningRegExp: 'Incorrect email input form',
      warningFetch: 'This email is already taken',
      fetchVerifier: async input => {
        const { foundValue } = await fetchInput('email', input);
        return foundValue === input && foundValue !== userData.name;
      }
    },
    name: {
      regExp: /^(?!search$)[\S]{5,40}$/,
      warningRegExp: 'Username length should be unique, 5-40 symbols (no spaces)',
      warningFetch: 'This username is already taken',
      fetchVerifier: async input => {
        const { foundValue } = await fetchInput('name', input);
        return foundValue === input;
      }
    },
    description: {},
    description_color: {},
    name_color: {},
    passwd: {
      regExp: /^[\S]{5,20}$/,
      warningRegExp: 'Password length should be 5-16 symbols (no spaces)',
    }
  };

  const { getVerifiersState, getOnChangeVerifier } = useVerifiers(signVerParams);
  const handleRadioChange = state => () => setCheckedRadio(state);
  useEffect(()=> {
    setUserDataInput({ ...userData, ...userDataInput })
  }, [userData, warnings]);
 
  return (
    <form id="edit-profile">
      <div className="edit-field">
        <img id="edit-logo" src={ logoDefault } />
        <div className="edit-logo-input">
          <input type="radio" checked={ checkedRadio } onChange={ handleRadioChange(true) } />
          <p>url:</p>
          <input type="text" disabled={ !checkedRadio } className="edit-input" />
        </div>
        <div className="edit-logo-input">
          <input type="radio" checked={ !checkedRadio } onChange={ handleRadioChange(false) } />
          <p>file:</p>
          <input type="file" className="edit-input" disabled={ checkedRadio } />
        </div>
      </div>

      <div className="edit-field" id="edit-uname">
        <div className="edit-name">
          <p>username:</p>
          <input type="text"  onChange={ getOnChangeVerifier('name') } className="edit-input" value={ userDataInput.name ? userDataInput.name : '' } style={{ color: userDataInput.name_color ? userDataInput.name_color : '#00d9ff', borderBottomColor: warnings.name && warnings.name.borderColor }}/>
          <i className="edit-warning">{warnings.name ? warnings.name.text : null}</i>
        </div>
        <div className="edit-name">
          <p>username color:</p>
          <input type="color" onChange={ getOnChangeVerifier('name_color') } className="edit-input" value={userDataInput.name_color ? userDataInput.name_color : '#00d9ff'}/>
        </div>
      </div>

      <div className="edit-field">
      <div className="edit-name">
          <p>description:</p>
          <textarea  onChange={ getOnChangeVerifier('description') } maxLength="100" id="edit-desc-area" rows="8" value={userDataInput.description ? userDataInput.description : '' } style={{ color: userDataInput.description_color ? userDataInput.description_color : '#00d9ff' }}>
          </textarea>
        </div>
        <div className="edit-name">
          <p>description color:</p>
          <input type="color" onChange={ getOnChangeVerifier('description_color') } className="edit-input" value={userDataInput.description_color ? userDataInput.description_color : '#00d9ff'}/>
        </div>
      </div>

      <div className="edit-field" id="edit-email">
        <div className="edit-name">
          <p>email:</p>
          <input type="email"  onChange={ getOnChangeVerifier('email') } className="edit-input" value={ userDataInput.email ? userDataInput.email : '' } style={{ borderBottomColor: warnings.email && warnings.email.borderColor }} />
          <i className="edit-warning">{warnings.email ? warnings.email.text : null}</i>
        </div>
      </div>
      <input type="submit" value="edit"/>
    </form>
  );
};

export default EditProfile;
