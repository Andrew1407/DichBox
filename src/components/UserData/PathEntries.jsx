import React, { useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { BoxesContext } from '../../contexts/BoxesContext';
import { MenuContext } from '../../contexts/MenuContext';
import { UserContext } from '../../contexts/UserContext';
import fileLogo from '../../styles/imgs/file-icon.png';
import dirLogo from '../../styles/imgs/folder-icon.png';
import removeEntry from '../../styles/imgs/entry-remove.png';
import renameEntry from '../../styles/imgs/entry-rename.png';
import '../../styles/path-entries.css';

const PathEntries = ({ entriesSearch, setFileManupulation, addFileVisible, setAddFileVisible }) => {
  const history = useHistory();
  const pathDepth = history.location.pathname
    .split('/').filter(x => x);
  const { pathEntries, fetchEntries, boxDetails } = useContext(BoxesContext);
  const { dispatchOpenedFiles, openedFiles, searchFileInOpenedList } = useContext(MenuContext);
  const { userData, username } = useContext(UserContext);
  const shortenName = str => str.length < 17 ? str : `${str.slice(0, 16)}...`;
  const filteredSearch = pathEntries
    .filter(x => x && x.name.includes(entriesSearch));

  const hadnleHistoryMove = historyPath => async () => {
    const initial = false;
    await fetchEntries(historyPath, initial);
    history.push(`/${historyPath.join('/')}`);
  };

  const handleClickFileClb = unit => async () => {
    const filePath = history.location.pathname;
    const foundFile = searchFileInOpenedList(unit.name, filePath);
    if (foundFile.index !== -1) {
      if (!foundFile.opened)
        dispatchOpenedFiles({ type: 'FILE_OPEN', index: foundFile.index });
      return;
    }
    const getBody = {
      ...unit,
      boxPath: pathDepth,
      follower: userData.follower,
      viewerName: username,
      editor: userData.editor
    };
    const { data } = await axios.post(`${process.env.APP_ADDR}/boxes/files/get`, getBody);
    const { foundData, found } = data;
    if (!found) return;
    const file = {
      name: unit.name,
      src: foundData,
      filePath,
      opened: true,
      type: unit.type
    };
    dispatchOpenedFiles({ type: 'FILE_APPEND', file });
  };
  const handleClickFile = useCallback(
    handleClickFileClb,
    [pathDepth, userData, username, openedFiles]
  );

  const handleFileManipulation = (action, file) => () => {
    if (addFileVisible)
      setAddFileVisible('');
    setFileManupulation({ ...file, action, pathDepth });
  };

  useEffect(() => {
    if (!pathEntries.length && userData.editor !== undefined) {
      const initial = true;
      fetchEntries(pathDepth, initial);
    }
  }, [userData, boxDetails, history.location]);

  return (
    <div className="menu-options-list" id="mol-units-list">
      { (pathDepth.length > 2) && 
        <div className="box-entries-item" onClick={ hadnleHistoryMove(pathDepth.slice(0, -1)) } >
          <img src={ dirLogo } />
          <p>...</p>
        </div>
      }
      { !!filteredSearch.length && filteredSearch.map(unit =>
        !unit.name ? null : 
        <div className="be-item-wrap" key={ unit.name }>
          <div title={ unit.name } className="box-entries-item" onClick={ unit.type === 'dir' ? hadnleHistoryMove([...pathDepth, unit.name]) : handleClickFile(unit) } >
            <img src={ unit.type === 'dir' ? dirLogo : fileLogo } />
            <p>{ shortenName(unit.name) }</p>
          </div>
          { userData.editor &&
            <div className="be-item-icons">
              <img src={ renameEntry } onClick={ handleFileManipulation('rename', unit) }/>
              <img src={ removeEntry } onClick={ handleFileManipulation('remove', unit) }/>
            </div>
          }
        </div>
      )}
      {  !!entriesSearch && !!pathEntries.length && !filteredSearch.length && 
        <p className="entries-empty">No files or directories were found</p> 
      }
      { !filteredSearch.length && !entriesSearch && <p className="entries-empty">This directory is empty</p> }
    </div>
  );
};

export default PathEntries;
