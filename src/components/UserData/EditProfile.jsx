import React, { useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { VerifiersContext } from '../../contexts/VerifiersContext';
import { UserContext } from '../../contexts/UserContext';
import CropImage from '../../modals/CropImage';
import EditField from '../inputFields/EditField';
import logoDefault from '../../styles/imgs/default-user-logo.png';
import '../../styles/edit-profile.css';

const EditProfile = ({ setMenuOption }) => {
  const history = useHistory();
  const { userData, dispatchUserData, id, setUsername } = useContext(UserContext);
  const { 
    useVerifiers,
    fetchInput,
    fetchPasswdVer,
    warnings,
    correctInput,
    dataInput,
    dispatchDataInput,
    cleanWarnings,
    setWarningsOnHandle
  } = useContext(VerifiersContext);
  const logo = userData.logo ? userData.logo : logoDefault;
  const [editedFields, setEditedFields] = useState([]);
  const [logoEdited, setLogoEdited] = useState(null);
  const [passwdFormHidden, setPasswdForm] = useState(true);
  const [cropModalHidden, setCropModalHidden] = useState(true);
  const handlePasswdFormClickClb = e => {
    e.preventDefault();
    if (!passwdFormHidden) {
      const filteredFields = editedFields.filter(x => 
        /^(?!(newP|p)asswd$)/.test(x)
      );
      setWarningsOnHandle({ passwd: {}, newPasswd: {} })
      setEditedFields(filteredFields);
      setWarningsOnHandle(null, { passwd: false, newPasswd: false });
      const dataReducerAction = {
        type: 'PUSH_DATA',
        data: { passwd: '', newPasswd: '' }
      };
      dispatchDataInput(dataReducerAction);
    }
    setPasswdForm(!passwdFormHidden);
  };
  const handlePasswdFormClick = useCallback(
    handlePasswdFormClickClb,
    [warnings, editedFields, passwdFormHidden]
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
        const fetchData = fetchInput('users');
        const { foundValue } = await fetchData('name', input);
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
        test: input => /^[\S]{5,20}$/.test(input) && input !== dataInput.passwd
      },
      warningRegExp: 'Password length should be 5-16 symbols (no spaces, unequal to previous one)',
    }
  };
  const { getVerifiersState, getOnChangeVerifier } = useVerifiers(signVerParams);
  const handleInputChangeClb = field => {
    const fieldVerifier = getOnChangeVerifier(field);
    return e => {
      fieldVerifier(e)
      if (!editedFields.includes(field)) {
        const newFields = field === 'passwd' ?
          [ field, 'newPasswd' ] : [ field ]
        setEditedFields([ ...editedFields, ...newFields ]);
      }
    };
  };
  const handleInputChange = useCallback(
    handleInputChangeClb,
    [editedFields, warnings, correctInput]
  );
  const ableSubmit = (editedFields.length ? 
    getVerifiersState(editedFields) : getVerifiersState())
    || logoEdited;
  const submitButton = {
    disabled: !ableSubmit,
    style: ableSubmit ?
      { borderColor: 'rgb(0, 255, 76)', color: 'rgb(0, 255, 76)' } :
      { borderColor: 'rgb(0, 217, 255)', color: 'rgb(0, 217, 255)' }
  };
  const submitEditedFieldsClb = async e => {
    e.preventDefault();
    const isCorrect = getVerifiersState(editedFields);
    const allowSubmit = isCorrect || logoEdited;
    if (!allowSubmit) return;
    const edited = editedFields.reduce((body, field) => {
      if (field === 'passwd') return body;
      if (field === 'newPasswd') 
        return { ...body, passwd: dataInput[field] };
      return { ...body, [field]: dataInput[field] }; 
    }, {});
    const editedBody = { id, edited };
    if (logoEdited) {
      editedBody.logo = logoEdited;
    }
    const { data } =  await axios.post('http://192.168.0.223:7041/users/edit', editedBody);
    dispatchUserData({ type: 'REFRESH_DATA', data });
    if (data.name) {
      setUsername(data.name);
      history.push('/' + data.name);
    }
    cleanWarnings();
    dispatchDataInput({ type: 'CLEAN_DATA' });
    setMenuOption('default');
  };
  const submitEditedFields = useCallback(
    submitEditedFieldsClb,
    [dataInput, id, editedFields, logoEdited, userData]
  );
  useEffect(()=> {
    const userDataIsFetched = Object.keys(userData).length;
    if (userDataIsFetched) {
      const editDefaultFields = {
        name: userData.name,
        email: userData.email,
        description: userData.description,
        name_color: userData.name_color,
        description_color: userData.description_color
      };
      const dataReducerAction = {
        type: 'APPEND_DATA',
        data: editDefaultFields
      };
      dispatchDataInput(dataReducerAction);
    }
  }, [userData, warnings]);
  
  return (
    <form id="edit-profile" onSubmit={ submitEditedFields } >
      <div className="edit-field">
          <img id="edit-logo" src={ logoEdited ? logoEdited : logo } />
          <CropImage  isOpen={ !cropModalHidden } {...{ cropModalHidden, setCropModalHidden, setLogoEdited }} />
          <input type="button" value="change logo" className="edit-btn" onClick={ () => setCropModalHidden(false) } />
          { logoEdited && <input type="button" value="cancel" value="cancel" className="edit-btn" onClick={ () => setLogoEdited(null) } /> }
      </div>

      <div className="edit-field" id="edit-uname">
        <EditField {...{ label: 'username', type: 'text', inputValue: dataInput.name, inputColor: dataInput.name_color, warning: warnings.name, handleOnChange: handleInputChange('name') }} />
        <EditField {...{ label: 'username color', type: 'color', inputValue: dataInput.name_color, handleOnChange: handleInputChange('name_color') }} />
      </div>

      <div className="edit-field">
        <EditField {...{ label: 'descriprion', textarea: true, inputValue: dataInput.description, inputColor: dataInput.description_color, handleOnChange: handleInputChange('description') }} />
        <EditField {...{ label: 'description color', type: 'color', inputValue: dataInput.description_color, handleOnChange: handleInputChange('description_color') }} />
      </div>

      <div className="edit-field" id="edit-email">
        <EditField {...{ label: 'email', type: 'email', inputValue: dataInput.email, warning: warnings.email, handleOnChange: handleInputChange('email') }} />
      </div>

      <div className="edit-field">
        { !passwdFormHidden &&
        <div>
          <EditField {...{ label: 'current password', type: 'password', inputValue: dataInput.passwd, warning: warnings.passwd, handleOnChange: handleInputChange('passwd') }} />
          <EditField {...{ disabled: !correctInput.passwd, label: 'new password', type: 'password', inputValue: dataInput.newPasswd, warning: warnings.newPasswd, handleOnChange: handleInputChange('newPasswd') }} />
        </div>
        }
        <input className="edit-btn" type="button" onClick={ handlePasswdFormClick } value={ passwdFormHidden ? 'change password' : 'cancel' }/>
      </div>

      <input className="edit-btn" id="edit-submit" type="submit" value="edit profile" disabled={ submitButton.disabled } style={ submitButton.style } />
    </form>
  );
};

export default EditProfile;
