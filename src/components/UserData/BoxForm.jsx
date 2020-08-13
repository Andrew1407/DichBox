import React, { useContext, useState, useReducer, useCallback } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { VerifiersContext } from '../../contexts/VerifiersContext';
import { UserContext } from '../../contexts/UserContext';
import CropImage from '../../modals/CropImage';
import EditField from '../inputFields/EditField';
import BoxPrivacy from '../inputFields/BoxPrivacy';
import boxPrivacyReducer from '../../reducers/boxPrivacyReducer';
import '../../styles/box-form.css';

const BoxForm = ({ setMenuOption, editParametrs }) => {
  const history = useHistory();
  const { 
    useVerifiers,
    fetchBoxInput,
    warnings,
    correctInput,
    dataInput,
    dispatchDataInput,
    cleanWarnings,
  } = useContext(VerifiersContext);
  const { id, username } = useContext(UserContext);
  const [logoEdited, setLogoEdited] = useState(null);
  const [cropModalHidden, setCropModalHidden] = useState(true);
  const [inputFields, setInputFields] = useState([]);
  const [privacy, dispatchPrivacy] = useReducer(boxPrivacyReducer, { type: 'public', accessList: [] })
  const verParams = {
    name: {
      regExp: /^(?!search$)[^\s/]{5,40}$/,
      warningRegExp: 'Box name length should be 5-40 symbols (unique, no spaces and no path definitions like "../path1/path2)"',
      warningFetch: 'You already have a box with the same name',
      fetchVerifier: async input => {
        const { foundValue } = await fetchBoxInput(id, input);
        return foundValue === input;
      }
    },
    name_color: {},
    description: {},
    description_color: {},
    privacy: {}
  };
  const { getVerifiersState, getOnChangeVerifier } = useVerifiers(verParams);
  const handleCanelClickClb = () => {
    cleanWarnings();
    dispatchDataInput({ type: 'CLEAN_DATA' });
    if (setMenuOption)
      setMenuOption('boxes');
    if (editParametrs)
      editParametrs.setEditBoxState(false);
  };
  const handleCanelClick = useCallback(handleCanelClickClb, []);
  const handleInputClb = field => {
    const fieldVerifier = getOnChangeVerifier(field);
    return e => {
      fieldVerifier(e);
      if (!inputFields.includes(field))
        setInputFields([ ...inputFields, field ]);
    }
  };
  const handleInput = useCallback(
    handleInputClb, 
    [inputFields, warnings, correctInput, dataInput]
  );
  const handleSubmitClb = async e => {
    e.preventDefault();
    const isCorrect = getVerifiersState(inputFields);
    if (isCorrect) {
      const access_level = privacy.type;
      const createBody = {
        username,
        boxData: { ...dataInput, access_level, owner_id: id },
        logo: logoEdited,
        privacyList: privacy.accessList.length ?
          privacy.accessList : null
      };
      const { data } = await axios.post('http://192.168.0.223:7041/boxes/create', createBody);
      history.push(`/${username}/${data.name}`);
      cleanWarnings();
      dispatchDataInput({ type: 'CLEAN_DATA' });
    }
  };
  const handleSubmit = useCallback(
    handleSubmitClb,
    [inputFields, dataInput, privacy, correctInput]
  );

  const ableSubmit = dataInput.name &&
    (getVerifiersState(inputFields) || logoEdited);
  const submitButton = {
    disabled: !ableSubmit,
    style: ableSubmit ?
      { borderColor: 'rgb(0, 255, 76)', color: 'rgb(0, 255, 76)' } :
      { borderColor: 'rgb(0, 217, 255)', color: 'rgb(0, 217, 255)' }
  };

  return (
    <form className="menu-form" onSubmit={ handleSubmit } >
      <h1 id="create-box-title">Create new box</h1>
      <div className="edit-field">
        { logoEdited && <img id="box-logo" src={ logoEdited } />}
        <CropImage  {...{ cropModalHidden, setCropModalHidden, setLogoEdited }} />
        <input type="button" value= { logoEdited ? 'change logo' : '*set logo' } className="edit-btn" id="box-form-crop" onClick={ () => setCropModalHidden(false) } />
        { logoEdited && <input type="button" value="cancel" value="cancel" className="edit-btn" onClick={ () => setLogoEdited(null) } /> }
      </div>

      <div className="edit-field">
        <EditField {...{ label: 'box name', type: 'text', inputValue: dataInput.name, inputColor: dataInput.name_color, warning: warnings.name, handleOnChange: handleInput('name') }} />
        <EditField {...{ label: '*name color', type: 'color', inputValue: dataInput.name_color, handleOnChange: handleInput('name_color') }} />
      </div>

      <div className="edit-field">
        <EditField {...{ label: '*descriprion', textarea: true, inputValue: dataInput.description, inputColor: dataInput.description_color, handleOnChange: handleInput('description') }} />
        <EditField {...{ label: '*description color', type: 'color', inputValue: dataInput.description_color, handleOnChange: handleInput('description_color') }} />
      </div>

      <div className="edit-field">
        <BoxPrivacy {...{ privacy, dispatchPrivacy }} />
      </div>
      
      <input className="edit-btn" type="submit" value="create box" { ...submitButton } />
      <input className="edit-btn" type="button" id="create-box-cancel" value="cancel" onClick={ handleCanelClick } />
    </form>
  )
};

export default BoxForm;
