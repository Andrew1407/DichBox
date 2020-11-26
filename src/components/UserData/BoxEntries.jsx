import React, { useContext, useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useHistory, useParams } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';
import { BoxesContext } from '../../contexts/BoxesContext';
import { MenuContext } from '../../contexts/MenuContext';
import ConfirmModal from '../../modals/ConfirmModal';
import BoxForm from './BoxForm';
import AddFile from './AddFile';
import FileManipulator from './FileManipulator';
import PathEntries from './PathEntries';
import trashBin from '../../styles/imgs/trash-bin.png';
import addFileLogo from '../../styles/imgs/add-file.png';
import addFolderLogo from '../../styles/imgs/add-folder.png';
import boxMoreLogo from '../../styles/imgs/box-more.png';
import boxEditLogo from '../../styles/imgs/box-edit.png';
import addImage from '../../styles/imgs/add-image.png';
import '../../styles/box-entries.css';


const BoxEntries = () => {
  const history = useHistory();
  const params = useParams();
  const [modalOptions, setModalOptions] = useState(null);
  const [entriesSearch, setEntriesSearch] = useState('');
  const [addFileVisible, setAddFileVisible] = useState('');
  const [fileManipulation, setFileManupulation] = useState(null);
  const { userData, dispatchUserData, pathName, username } = useContext(UserContext);
  const {
    setMenuOption,
    openedFiles,
    dispatchOpenedFiles,
    setFoundErr,
    setLoading
  } = useContext(MenuContext);
  const { 
    boxInfoHidden,
    setBoxHiddenState,
    boxDetails,
    setBoxDetails,
    editBox,
    setEditBoxState,
    setPathEntries,
    setBoxErr,
    boxErr,
    fetchEntries
  } = useContext(BoxesContext);
  const boxPath = history.location.pathname
    .split('/')
    .filter(x => x)
    .slice(1);

  const handleEntriesSearchClb = e => {
    e.preventDefault();
    setEntriesSearch(e.target.value);
  };
  const handleEntriesSearch = useCallback(handleEntriesSearchClb, [entriesSearch]);

  const handleViewBoxesClickClb = () => {
    setMenuOption('boxes');
    setPathEntries([]);
    setBoxDetails([]);
    setBoxHiddenState(false);
    history.push(`/${pathName}`);
  };
  const handleViewBoxesClick = useCallback(handleViewBoxesClickClb, [pathName]);

  const boxRemoveSubmit = async () => {
    setLoading(true);
    const rmBody = {
      confirmation: userData.ownPage && 'permitted',
      username,
      boxName: boxDetails.name,
      ownPage: userData.ownPage
    };
    const { data } = await axios.post(`${process.env.APP_ADDR}/boxes/remove`, rmBody);
    if (data.removed) {
      handleViewBoxesClick();
      dispatchOpenedFiles({ type: 'FILES_CLOSE_ALL' });
    }
    setLoading(false);
  };

  const handleBoxRemoveClb = () => setModalOptions({
    setModalOptions,
    isOpen: true,
    message: `Remove box "${boxDetails.name}" inevitably`,
    okClb: boxRemoveSubmit
  });
  const handleBoxRemove = useCallback(
    handleBoxRemoveClb,
    [boxDetails, userData, openedFiles]
  );

  const handleEntriesClickClb = i => async () => {
    const pathEnd = i + 1;
    if (boxPath.length == pathEnd)
      return;
    const initial = false;
    const nextPath = [userData.name, ...boxPath.slice(0, pathEnd)];
    await fetchEntries(nextPath, initial);
    setFileManupulation(null);
    history.push(`/${nextPath.join('/')}`);
  };
  const handleEntriesClick = useCallback(handleEntriesClickClb, [boxPath]);

  const handleAddFile = type => () => {
    if (fileManipulation)
      setFileManupulation(null);
    if (!addFileVisible || addFileVisible !== type)
      setAddFileVisible(type);
    else
      setAddFileVisible('');
  };

  useEffect(() => {
    const fetchBoxData = async () => {
      const equalAddress = pathName === params.username;
      if (!(equalAddress && userData.name && !boxDetails.name))
        return;
      const dataBody = {
        boxName: params.box,
        follower: userData.follower,
        ownerName: userData.name,
        viewerName: username
      };
      setLoading(true);
      try {
        const { data } = await axios.post(`${process.env.APP_ADDR}/boxes/details`, dataBody);
        if (data.name) {
          setBoxDetails(data);
          const editor = data.editor
          dispatchUserData({ type: 'REFRESH_DATA', data: { editor } });
          if (boxErr)
          setBoxErr(false);
        } else {
          setBoxErr(true);
        }
      } catch (e) {
        if (!e.response) {
          const msg = 'It\'s a secret, but something terrible happened on the DichBox server...';
          setFoundErr(['server', msg]);
        } else {  
          const { status, data } = e.response;
          const errType = status === 404 ? (boxPath.length > 1 ? 'dir' : 'box') : 'server';
          setFoundErr([errType, data.msg]);
        }
      }
      setLoading(false);
    };

    fetchBoxData();
  }, [userData]);


  return ( editBox ? 
    <BoxForm editParametrs={{ setEditBoxState, boxDetails, edit: true }} /> :
    <div className="menu-form">
      <div>
        { !boxInfoHidden && boxDetails.logo && <img id="entries-logo" src={ boxDetails.logo }/> }
        <div className="name-desc">
          { !boxInfoHidden &&
            <div>
              <p className="nd-name" style={{ color: boxDetails.name_color }}>{ boxDetails.name }</p>
              <p className="nd-desc" style={{ color: boxDetails.description_color }} >{ boxDetails.description }</p>
              <p id="nd-owner">Creator: <span style={{ color: boxDetails.owner_nc }}>{ boxDetails.owner_name }</span></p>
              <p id="nd-box-type" >Type: <span>{ boxDetails.access_level }</span></p>
              <p className="nd-box-info" >Created: <span>{ boxDetails.reg_date }</span></p>
              <p className="nd-box-info" id="last-edited" >Last edited: <span>{ boxDetails.last_edited }</span></p>
            </div>
          }
          <div id="entries-user-menu">
            <div id="entries-editor">
              <div id="entries-options" style={{ justifyContent: userData.ownPage ? 'space-between' : boxDetails.editor ? 'space-around' : 'center' }} >
                { boxDetails.editor && <img src={ addImage } className="entries-imgs" onClick={ handleAddFile('image') } title="Add image"/>}
                { boxDetails.editor && <img src={ addFileLogo } className="entries-imgs" onClick={ handleAddFile('file') } title="Add file"/>}
                { boxDetails.editor && <img src={ addFolderLogo } className="entries-imgs" onClick={ handleAddFile('dir') } title="Add directory"/>}
                { userData.ownPage && <img src={ boxEditLogo } className="entries-imgs" onClick={ () => setEditBoxState(true) } title="Edit box info"/>}
                { userData.ownPage && <img src={ trashBin } className="entries-imgs" onClick={ handleBoxRemove } title={ `Remove "${boxDetails.name}" box` }/>}
                <img src={ boxMoreLogo } className="entries-imgs" onClick={ () => setBoxHiddenState(!boxInfoHidden) } title={ (boxInfoHidden ? 'Show' : 'Hide') + ' box description' }/>
              </div>
              <AddFile {...{ setAddFileVisible, addFileVisible, pathName: boxPath, fileManipulation }} />
              <FileManipulator {...{ fileManipulation, pathName: boxPath, setFileManupulation, addFileVisible }} />
            </div>

            <div id="entries-search">
              <label htmlFor="entriesSearch">search:</label>
              <input spellCheck="false" type="text" name="entriesSearch" onChange={ handleEntriesSearch } />
            </div>
            <p id="box-entries-path">
              { boxPath.map((x, i) => 
                <span {...{ onClick: handleEntriesClick(i), key: i, id: i ? '' : 'be-path-first', style: i ? {} : { color: boxDetails.name_color } }} >{ i ? ` / ${x}` : x }</span>
              )}
            </p>
          </div>
        </div>
      </div>
      <PathEntries  {...{ entriesSearch, setFileManupulation, addFileVisible, setAddFileVisible  }} />
      <input className="edit-btn" id="box-entries-back-btn" type="button" value="view user boxes" onClick={ handleViewBoxesClick } />
      <ConfirmModal { ...modalOptions } />
    </div>  
  );
};

export default BoxEntries;
