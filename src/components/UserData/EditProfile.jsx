import React, { useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import { VerifiersContext } from '../../contexts/VerifiersContext';
import { MainContext } from '../../contexts/MainContext';
import logoDefault from '../../styles/imgs/default-user-logo.png';
import '../../styles/edit-profile.css';

const EditProfile = ({ setMenuOption }) => {
  const { userData, setUserData, id } = useContext(MainContext);
  const { 
    useVerifiers,
    fetchInput,
    setCorrectState,
    fetchPasswdVer,
    warnings,
    setWarning,
    correctInput,
    userDataInput,
    setUserDataInput 
  } = useContext(VerifiersContext);
  const [editFields, setEditFields] = useState([]);
  const [uploadedLogo, setLogo] = useState({});
  const [showLogo, setShowLogo] = useState(logoDefault);
  const [checkedRadio, setCheckedRadio] = useState(true);
  const [passwdFormHidden, setPasswdForm] = useState(true);
  const handleRadioChange = state => () => setCheckedRadio(state);
  const handleLogoChange = inputType => {
    const logo = { type: inputType };
    const uploaders = {
      url (e) {
        e.preventDefault();
        logo.src = e.target.value;
        setLogo(logo);
        setShowLogo(logo.src);
      },
      file (e) {
        e.preventDefault();
        logo.src = e.target.files[0];
        setLogo(logo);
        const reader = new FileReader();
        reader.onload = () => {
          if (reader.readyState === 2)
          setShowLogo(reader.result)
        };
        reader.readAsDataURL(logo.src);
      }
    };
    const uploader = uploaders[inputType];
    return e => uploader(e);
  };
  const handlePasswdFormClickClb = e => {
    e.preventDefault();
    if (!passwdFormHidden) {
      const filteredFields = editFields.filter(x => 
        /^(?!(newP|p)asswd$)/.test(x)
      );
      setWarning({ ...warnings, passwd: {}, newPasswd: {} })
      setEditFields(filteredFields);
    }
    setPasswdForm(!passwdFormHidden);
  };
  const handlePasswdFormClick = useCallback(
    handlePasswdFormClickClb,
    [warnings, editFields, passwdFormHidden]
  );
  const signVerParams = {
    email: {
      regExp: /^([a-z_\d\.-]+)@([a-z\d]+)\.([a-z]{2,8})(\.[a-z]{2,8})*$/,
      warningRegExp: 'Incorrect email input form',
      warningFetch: 'This email is already taken',
      fetchVerifier: async input => {
        const { foundValue } = await fetchInput('email', input);
        return foundValue === input && foundValue !== userData.email;
      }
    },
    name: {
      regExp: /^(?!search$)[\S]{5,40}$/,
      warningRegExp: 'Username length should be unique, 5-40 symbols (no spaces)',
      warningFetch: 'This username is already taken',
      fetchVerifier: async input => {
        const { foundValue } = await fetchInput('name', input);
        return foundValue === input && foundValue !== userData.name;
      }
    },
    description: {},
    description_color: {},
    name_color: {},
    passwd: {
      regExp: /^[\S]{5,20}$/,
      warningRegExp: 'Password length should be 5-16 symbols (no spaces)',
      warningFetch: 'Wrong password',
      fetchVerifier: async input => {
        const { foundValue } = await fetchPasswdVer(userData.id, input);
        return foundValue !== input;
      }
    },
    newPasswd: {
      regExp: {
        test: input => /^[\S]{5,20}$/.test(input) && input !== userDataInput.passwd
      },
      warningRegExp: 'Password length should be 5-16 symbols (no spaces, unequal to previous one)',
    }
  };
  const { getVerifiersState, getOnChangeVerifier } = useVerifiers(signVerParams);
  const handleInputChangeClb = field => {
    const fieldVerifier = getOnChangeVerifier(field);
    return e => {
      fieldVerifier(e)
      if (!editFields.includes(field)) {
        const newFields = field === 'passwd' ?
          [ field, 'newPasswd' ] : [ field ]
        setEditFields([ ...editFields, ...newFields ]);
      }
    };
  };
  const handleInputChange = useCallback(
    handleInputChangeClb,
    [editFields, warnings, correctInput]
  );
  const ableSubmit = editFields.length ? 
    getVerifiersState(editFields) : getVerifiersState();
  const submitButton = {
    disabled: !ableSubmit,
    style: ableSubmit ?
      { borderColor: 'rgb(0, 255, 76)', color: 'rgb(0, 255, 76)' } :
      { borderColor: 'rgb(0, 217, 255)', color: 'rgb(0, 217, 255)' }
  };
  const submitEditedFieldsClb = async e => {
    e.preventDefault();
    const edited = editFields.reduce((body, field) => {
      if (field === 'passwd') return body;
      if (field === 'newPasswd') 
        return { ...body, passwd: userDataInput[field] };
      return { ...body, [field]: userDataInput[field] }; 
    }, {});
    const { data } =  await axios.post('http://192.168.0.223:7041/users/edit_user', { id, edited });
    setWarning({});
    setCorrectState({});
    setUserData({ ...userData, ...data.editedResponse})
    setMenuOption('default');
  };
  const submitEditedFields = useCallback(
    submitEditedFieldsClb,
    [userData, id, editFields]
  );

  useEffect(()=> {
    setUserDataInput({ ...userData, ...userDataInput })
  }, [userData, warnings]);
 
  return (
    <form id="edit-profile" onSubmit={ submitEditedFields } >
      <div className="edit-field">
        <img id="edit-logo" src={ showLogo } />
        <div className="edit-logo-input">
          <input type="radio" checked={ checkedRadio } onChange={ handleRadioChange(true) } />
          <p>url:</p>
          <input type="text" onChange={ handleLogoChange('url') } disabled={ !checkedRadio } className="edit-input" />
        </div>
        <div className="edit-logo-input">
          <input type="radio" checked={ !checkedRadio } onChange={ handleRadioChange(false) } />
          <p>file:</p>
          <input type="file" onChange={ handleLogoChange('file') } accept="image/*" className="edit-input" disabled={ checkedRadio } />
        </div>
      </div>

      <div className="edit-field" id="edit-uname">
        <div className="edit-name">
          <p>username:</p>
          <input type="text"  onChange={ handleInputChange('name') } className="edit-input" value={ userDataInput.name ? userDataInput.name : '' } style={{ color: userDataInput.name_color ? userDataInput.name_color : '#00d9ff', borderBottomColor: warnings.name && warnings.name.borderColor }}/>
          <i className="edit-warning">{warnings.name ? warnings.name.text : null}</i>
        </div>
        <div className="edit-name">
          <p>username color:</p>
          <input type="color" onChange={ handleInputChange('name_color') } className="edit-input" value={userDataInput.name_color ? userDataInput.name_color : '#00d9ff'}/>
        </div>
      </div>

      <div className="edit-field">
        <div className="edit-name">
          <p>description:</p>
          <textarea  onChange={ handleInputChange('description') } maxLength="150" id="edit-desc-area" rows="8" value={userDataInput.description ? userDataInput.description : '' } style={{ color: userDataInput.description_color ? userDataInput.description_color : '#00d9ff' }}>
          </textarea>
        </div>
        <div className="edit-name">
          <p>description color:</p>
          <input type="color" onChange={ handleInputChange('description_color') } className="edit-input" value={userDataInput.description_color ? userDataInput.description_color : '#00d9ff'}/>
        </div>
      </div>

      <div className="edit-field" id="edit-email">
        <div className="edit-name">
          <p>email:</p>
          <input type="email" onChange={ handleInputChange('email') } className="edit-input" value={ userDataInput.email ? userDataInput.email : '' } style={{ borderBottomColor: warnings.email && warnings.email.borderColor }} />
          <i className="edit-warning">{warnings.email ? warnings.email.text : null}</i>
        </div>
      </div>

      <div className="edit-field">
        { !passwdFormHidden &&
        <div>
          <div>
            <p>current password:</p>
            <input type="password" className="edit-input" onChange={ handleInputChange('passwd') } style={{ borderBottomColor: warnings.passwd && warnings.passwd.borderColor }} />
            <i className="edit-warning">{warnings.passwd ? warnings.passwd.text : null}</i>
          </div>
          <div className="edit-name">
            <p>new password:</p>
            <input type="password" onChange={ handleInputChange('newPasswd') } disabled={ !correctInput.passwd } className="edit-input" style={{ borderBottomColor: warnings.newPasswd && warnings.newPasswd.borderColor }} />
            <i className="edit-warning">{warnings.newPasswd ? warnings.newPasswd.text : null}</i>
          </div>
        </div>
        }
        <input className="edit-btn" type="button" onClick={ handlePasswdFormClick } value={ passwdFormHidden ? 'change password' : 'cancel' }/>
      </div>

      <input className="edit-btn" id="edit-submit" type="submit" value="edit profile" disabled={ submitButton.disabled } style={ submitButton.style } />
    </form>
  );
};

export default EditProfile;
