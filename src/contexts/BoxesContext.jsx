import React, { createContext, useState, useContext, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import { MenuContext } from './MenuContext';
import { UserContext } from './UserContext';

export const BoxesContext = createContext();

const BoxesContextProvider = props => {
  const history = useHistory();
  const { userData, username } = useContext(UserContext);
  const { dispatchOpenedFiles } = useContext(MenuContext);
  const [boxesList, setBoxesList] = useState([]);
  const [listOption, setListOption] = useState('all');
  const [boxInfoHidden, setBoxHiddenState] = useState(false);
  const [boxDetails, setBoxDetails] = useState({});
  const [editBox, setEditBoxState] = useState(false);
  const [pathEntries, setPathEntries] = useState([]);
  const [boxErr, setBoxErr] = useState(false);

  const fetchEntriesClb = async (boxPath, initial) => {
    const filesBody = {
      boxPath,
      viewerName: username,
      follower: userData.follower,
      initial
    };
    const { data } = await axios.post('http://192.168.0.223:7041/boxes/files/list', filesBody);
    const { entries } = data;
    if (!entries) {
      setBoxErr(true);
      return;
    }
    const { type, dir, file } = entries;
    if (type === 'dir')
      setPathEntries(dir.src.length ? dir.src : [null]);
    if (type === 'file')
      if (initial)
        setBoxErr(true);
      else
      dispatchOpenedFiles({ type: 'FILE_APPEND', file });
  };
  const fetchEntries = useCallback(fetchEntriesClb, [userData, history.location]);


  return (
    <BoxesContext.Provider value={{ fetchEntries, boxErr, setBoxErr, pathEntries, setPathEntries, boxesList, setBoxesList, listOption, setListOption, boxInfoHidden, setBoxHiddenState, boxDetails, setBoxDetails, editBox, setEditBoxState }} >
      { props.children }
    </BoxesContext.Provider>
  );
};

export default BoxesContextProvider;
