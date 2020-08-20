import React, { useContext, useEffect } from 'react';
import axios from 'axios';
import { BoxesContext } from '../../contexts/BoxesContext';
import { useParams, useHistory } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';
import '../../styles/path-entries.css';

const PathEntries = () => {
  const params = useParams();
  const history = useHistory();
  const { pathEntries, setPathEntries, boxDetails } = useContext(BoxesContext);
  const { userData, username } = useContext(UserContext);

  useEffect(() => {
    const fetchFiles = async () => {
      const extraPath = history.location.pathname
        .split('/')
        .slice(3);
      const filesBody = {
        ownerName: params.username,
        viewerName: username,
        boxName: params.box,
        follower: userData.follower,
        extraPath
      };
      const { data } = await axios.post('http://192.168.0.223:7041/boxes/files', filesBody);
    };

    if (boxDetails.name)
      fetchFiles();
  }, [boxDetails]);

  return (
    <div className="menu-options-list">
      <p id="entries-empty">This directory is empty</p>
    </div>
  );
};

export default PathEntries;
