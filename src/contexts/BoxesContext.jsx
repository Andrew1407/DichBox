import React, { createContext, useState, useContext, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import { MenuContext } from './MenuContext';
import { UserContext } from './UserContext';

export const BoxesContext = createContext();

const BoxesContextProvider = props => {
  const history = useHistory();
  const { userData, username } = useContext(UserContext);
  const {
    dispatchOpenedFiles,
    setFoundErr,
    setLoading
  } = useContext(MenuContext);
  const [boxesList, setBoxesList] = useState([]);
  const [listOption, setListOption] = useState('all');
  const [boxInfoHidden, setBoxHiddenState] = useState(false);
  const [boxDetails, setBoxDetails] = useState({});
  const [editBox, setEditBoxState] = useState(false);
  const [pathEntries, setPathEntries] = useState([]);

  const fetchEntriesClb = async (boxPath, initial) => {
    setLoading(true);
    const filesBody = {
      boxPath,
      viewerName: username,
      follower: userData.follower,
      editor: userData.editor,
      initial
    };
    try {
      const { data } = await axios.post(`${process.env.APP_ADDR}/boxes/files/list`, filesBody);
      const { type, dir, file } = data.entries;
      setLoading(false);
      if (type === 'dir') {
        setPathEntries(dir.src.length ? dir.src : [null]);
        return;
      }
      if (type === 'file')
        if (initial) setBoxErr(true);
        else dispatchOpenedFiles({ type: 'FILE_APPEND', file });
    } catch (e) {
      if (!e.response) {
        const msg = 'It\'s a secret, but something terrible happened on the DichBox server...';
        setFoundErr(['server', msg]);
      } else { 
        const { status, data } = e.response;
        const errType = status === 404 ? (boxPath.length > 2 ? 'dir' : 'box') : 'server';
        setFoundErr([errType, data.msg]);
      }
      setLoading(false);
    }
  };
  const fetchEntries = useCallback(fetchEntriesClb, [userData, history.location]);
  
  return (
    <BoxesContext.Provider value={{ fetchEntries, pathEntries, setPathEntries, boxesList, setBoxesList, listOption, setListOption, boxInfoHidden, setBoxHiddenState, boxDetails, setBoxDetails, editBox, setEditBoxState }} >
      { props.children }
    </BoxesContext.Provider>
  );
};

export default BoxesContextProvider;
