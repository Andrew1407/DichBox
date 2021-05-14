import React, { useContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { useHistory, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { VerifiersContext } from '../../contexts/VerifiersContext';
import { UserContext } from '../../contexts/UserContext';
import { BoxesContext } from '../../contexts/BoxesContext';
import { MenuContext } from '../../contexts/MenuContext';
import { componentMotion } from '../../styles/motions/menu-components';
import CropImage from '../../modals/CropImage';
import EditField from '../inputFields/EditField';
import BoxPrivacy from '../inputFields/BoxPrivacy';
import SearchUsers from '../inputFields/SearchUsers';
import '../../styles/box-form.css';

const BoxForm = ({ editParametrs }) => {
  const history = useHistory();
  const params = useParams();
  const { boxDetails, setBoxDetails, setEditBoxState } = useContext(BoxesContext);
  const {
    setMenuOption,
    setLoading,
    setFoundErr,
    openedFiles,
    dispatchOpenedFiles
  } = useContext(MenuContext);
  const { 
    useVerifiers,
    fetchBoxInput,
    warnings,
    correctInput,
    dataInput,
    dispatchDataInput,
    cleanWarnings
  } = useContext(VerifiersContext);
  const { username, userData } = useContext(UserContext);
  const [logoEdited, setLogoEdited] = useState(null);
  const [cropModalHidden, setCropModalHidden] = useState(true);
  const [inputFields, setInputFields] = useState([]);
  const [changedList, setChangedList] = useState(false);
  const [privacy, setPrivacy] = useState('public');
  const [limitedList, setLimitedList] = useState([]);
  const [editorsList, setEditorsList] = useState([]);
  const verParams = {
    name: {
      regExp: /^[^#%\?\s/]{1,40}$/,
      warningRegExp: 'Box name length should be 1-40 symbols (unique, no spaces no spaces, "?", "#", "%" or path definitions like: "../path1/path2/...")',
      warningFetch: 'You already have a box with the same name',
      fetchVerifier: async input => {
        const { foundValue } = await fetchBoxInput(username, input);
        let res = foundValue === input;
        if (editParametrs.edit)
          res = res && foundValue !== editParametrs.boxDetails.name;
        return res;
      },
      defaultState: editParametrs.edit ?
        { value: editParametrs.boxDetails.name, correct: true } :
        { value: '', correct: false }
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
    if (editParametrs.edit)
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
    const isCorrect = editParametrs.edit ?
      inputFields.length || !!logoEdited || changedList :
      getVerifiersState(inputFields) && inputFields.length;
    const access_level = privacy;
    const [ editors, limitedUsers ] = [editorsList, limitedList]
      .map(arr => arr.map(user => user.name));
    const submitBody = {
      username,
      logo: logoEdited,
      limitedUsers: privacy === 'limited' ? limitedUsers : null,
      editors
    };
    setLoading(true);
    try {  
      if (!editParametrs.edit && isCorrect) {
        const createBody = {
          ...submitBody,
          boxData: { ...dataInput, access_level },
        };
        const { data } = await axios.post(`${process.env.APP_ADDR}/boxes/create`, createBody);
        dispatchOpenedFiles({ type: 'FILES_CLOSE_ALL' });
        history.push(`/${username}/${data.name}`);
      } else if (editParametrs.edit && isCorrect) {
        const edited = !inputFields.length ? null :
          inputFields.reduce((obj, field) => (
            { ...obj, [field]: dataInput[field] }
          ), {});
        if (edited && params.box === edited.name) delete edited.name;
        const editBody = {
          ...submitBody,
          boxData: privacy === boxDetails.access_level ? 
            edited : { ...edited, access_level },
          boxName: params.box,
        };
        const { data } = await axios.post(`${process.env.APP_ADDR}/boxes/edit`, editBody);
        const boxDetailsEdited = { ...boxDetails, ...data };
        if (logoEdited === 'removed') boxDetailsEdited.logo = null;
        setBoxDetails(boxDetailsEdited);
        const nameEdited = typeof edited?.name === 'string'
          && params.box !== edited.name
        if (nameEdited && openedFiles.length) {
          const oldPath = `/${username}/${params.box}`;
          const newPath = `/${username}/${edited.name}`;
          dispatchOpenedFiles({ type: 'FILES_RENAME_PATH', oldPath, newPath });
        }
        if (data.name) history.push(`/${username}/${data.name}`);
        setEditBoxState(false);
      }
    } catch {
      const msg = 'It\'s a secret, but something terrible happened on the DichBox server...';
      setFoundErr(['server', msg]);
    } finally {
      setLoading(false);
    }
  };
  const handleSubmit = useCallback(
    handleSubmitClb,
    [inputFields, dataInput, privacy, correctInput, logoEdited, limitedList, editorsList, userData, boxDetails]
  );

  const ableSubmit = editParametrs.edit ? 
    inputFields.length || !!logoEdited || changedList :
    dataInput.name && (getVerifiersState(inputFields) || !!logoEdited);
  const submitButton = {
    disabled: !ableSubmit,
    style: ableSubmit ?
      { borderColor: 'rgb(0, 255, 76)', color: 'rgb(0, 255, 76)' } :
      { borderColor: 'rgb(0, 217, 255)', color: 'rgb(0, 217, 255)' }
  };
  
  useEffect(() => {
    const fetchAccessList = async () => {
      const { boxDetails } = editParametrs;
      const boxPrivacy = boxDetails.access_level;
      const defaultValues = {};
      const wasteFields = /^(owner_(name|nc)|reg_date|last_edited|access_level|logo)$/;
      for (const key in boxDetails)
        if (!wasteFields.test(key))
          defaultValues[key] = boxDetails[key];
      dispatchDataInput({ type: 'SET_DATA', data: defaultValues });
      const listBody = {
        username: boxDetails.owner_name,
        boxName: boxDetails.name
      };
      const { data } = await axios.post(`${process.env.APP_ADDR}/users/access_lists`, listBody);
      const { limitedUsers, editors } = data;
      setLimitedList(limitedUsers);
      setEditorsList(editors);
      setPrivacy(boxPrivacy);
    };

    if (editParametrs.edit) fetchAccessList();

    return () => {
      cleanWarnings();
      dispatchDataInput({ type: 'CLEAN_DATA' });
      setLimitedList([]);
      setEditorsList([]);
    };
  }, []);

  return (
    <motion.form
      { ...componentMotion }
      className="menu-form" data-testid="box-form-test" onSubmit={ handleSubmit }
    >
      <h1 id="create-box-title">{ editParametrs.edit ? 'Edit box' : 'Create new box'}</h1>
      <div className="edit-field">
        { (logoEdited || editParametrs.boxDetails.logo) && logoEdited !== 'removed' &&
          <img id="box-logo" src={ logoEdited && logoEdited !== 'removed' ? logoEdited : editParametrs.boxDetails.logo } />
        }
        <CropImage  {...{ cropModalHidden, setCropModalHidden, setLogoEdited }} />
        <input type="button" value= { logoEdited ? 'change logo' : '*set logo' } className="edit-btn edit-box-btn" id="box-form-crop" onClick={ () => setCropModalHidden(false) } />
        { editParametrs.boxDetails.logo && logoEdited !== 'removed' && <input type="button" value="remove logo" className="edit-btn edit-box-btn" onClick={ () => setLogoEdited('removed') } /> }
        { logoEdited && <input type="button" value="cancel" className="edit-btn edit-box-btn" onClick={ () => setLogoEdited(null) } /> }
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
        <BoxPrivacy {...{ privacy, setPrivacy, limitedList, setLimitedList, setChangedList, changedList }} />
      </div>

      <div className="edit-field">
        <p>*allow users to view/edit/remove/create directories and files:</p>
        <SearchUsers {...{ changedList, setChangedList, inputList: editorsList, setInputList: setEditorsList }}/>
      </div>
      
      <input className="edit-btn" type="submit" value={ editParametrs.edit ? 'edit box' : 'create box'} { ...submitButton } />
      <input className="edit-btn" type="button" id="create-box-cancel" value="cancel" onClick={ handleCanelClick } />
    </motion.form>
  )
};

export default BoxForm;
