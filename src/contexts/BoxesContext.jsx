import React, { createContext, useState, useEffect, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { MenuContext } from './MenuContext';

export const BoxesContext = createContext();

const BoxesContextProvider = props => {
  const history = useHistory();
  const { menuOption } = useContext(MenuContext)
  const [boxesList, setBoxesList] = useState([]);
  const [listOption, setListOption] = useState('all');
  const [boxInfoHidden, setBoxHiddenState] = useState(false);
  const [boxDetails, setBoxDetails] = useState({});
  const [editBox, setEditBoxState] = useState(false);
  const [pathEntries, setPathEntries] = useState([]);

  useEffect(() => {
    setListOption('all');
    if (menuOption !== 'createBox') {
      setBoxDetails({});
      setPathEntries([]);
    }
  },[history.location.pathname]);

  return (
    <BoxesContext.Provider value={{ pathEntries, setPathEntries, boxesList, setBoxesList, listOption, setListOption, boxInfoHidden, setBoxHiddenState, boxDetails, setBoxDetails, editBox, setEditBoxState }} >
      { props.children }
    </BoxesContext.Provider>
  );
};

export default BoxesContextProvider;
