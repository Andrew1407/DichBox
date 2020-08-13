import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useHistory, useParams } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';
import BoxForm from './BoxForm';
import '../../styles/box-entries.css';
import trashBin from '../../styles/imgs/trash-bin.png';
import addFileLogo from '../../styles/imgs/add-file.png';
import addFolderLogo from '../../styles/imgs/add-folder.png';
import boxMoreLogo from '../../styles/imgs/box-more.png';
import boxEditLogo from '../../styles/imgs/box-edit.svg';


const BoxEntries = () => {
  const history = useHistory();
  const params = useParams();
  const { userData, pathName, id } = useContext(UserContext);
  const [boxInfoHidden, setBoxHiddenState] = useState(false);
  const [editBox, setEditBoxState] = useState(false);
  const [boxDetails, setBoxDetails] = useState({})
  const [boxData, setBoxData] = useState({});

  useEffect(() => {
    const fetchBoxData = async () => {
      const path = history.location.pathname;
      const userDataFetched = Object.keys(userData).length;
      const equalAddress = pathName === path.split('/').slice(1, 2)[0];
      if (!(equalAddress && userDataFetched))
        return;
      const dataBody = {
        path,
        follower: userData.follower,
        owner_id: userData.id,
        viewer_id: id
      };
      const { data } = await axios.post('http://192.168.0.223:7041/boxes/details', dataBody);
      setBoxDetails(data);
    };

    fetchBoxData();
  }, [userData]);

  return (
    editBox ? 
    <BoxForm editParametrs={{ setEditBoxState }} /> :
    <div className="menu-form">
      <div>
        { !boxInfoHidden && boxDetails.logo && <img id="entries-logo" src={ boxDetails.logo }/> }
        <div className="name-desc">
          { !boxInfoHidden &&
            <div>
              <p className="nd-name" style={{ color: boxDetails.name_color }} >{ boxDetails.name }</p>
              <p className="nd-desc" style={{ color: boxDetails.description_color }} >{ boxDetails.description }</p>
              <p id="nd-owner">Creator: <span style={{ color: boxDetails.owner_nc }}>{ boxDetails.owner_name }</span></p>
              <p className="nd-box-info" >Created: <span>{ boxDetails.reg_date }</span></p>
              <p className="nd-box-info" id="last-edited" >Last edited: <span>{ boxDetails.last_edited }</span></p>
            </div>
          }
          <div id="entries-user-menu"> 
            <div id="entries-options" style={{ justifyContent: userData.ownPage ? 'space-between' : 'center' }} >
              { userData.ownPage && <img src={ addFileLogo } className="entries-imgs"/>}
              { userData.ownPage && <img src={ addFolderLogo } className="entries-imgs"/>}
              { userData.ownPage && <img src={ boxEditLogo } className="entries-imgs" onClick={ () => setEditBoxState(true) } />}
              { userData.ownPage && <img src={ trashBin } className="entries-imgs"/>}
              <img src={ boxMoreLogo } className="entries-imgs" onClick={ () => setBoxHiddenState(!boxInfoHidden) } />
            </div>

            <div id="entries-search">
              <label htmlFor="entriesSearch">search:</label>
              <input type="text" name="entriesSearch"/>
            </div>
          </div>
        </div>
      </div>
      <div className="menu-options-list">
        <p id="entries-empty">This directory is empty</p>
      </div>
    </div>
  );
};

export default BoxEntries;
