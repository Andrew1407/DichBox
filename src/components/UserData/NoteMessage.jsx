import React from 'react';
import { useHistory } from 'react-router-dom';

const NoteMessage = ({ type, userName, userColor, boxName, boxColor, msg }) => {
  const history = useHistory();
  const handleRouteMove = (user, box = '') => e => {
    e.preventDefault();
    if (box)
      history.push(`/${user}/${box}`);
    else
      history.push(`/${user}`);
  };

  const listMsg = /^((viewer|editor)(Add|Rm))$/;
  if (listMsg.test(type))
    return (
      <div className="note-msg">
        <p>
          <i>{ msg[0] }</i>
          <span onClick={ handleRouteMove(userName) } style={{ color: userColor }}> { userName } </span>
          <i>{ msg[1] }</i>
          <span onClick={ handleRouteMove(userName, boxName) } style={{ color: boxColor }}> { boxName } </span>
          <i>{ msg[2] }.</i>
        </p>
      </div>
    );
  if (type === 'boxAdd')
    return (
      <div className="note-msg">
        <p>
          <i>{ msg[0] }</i>
          <span onClick={ handleRouteMove(userName) } style={{ color: userColor }}> { userName } </span>
          <i>{ msg[1] }</i>
          <span onClick={ handleRouteMove(userName, boxName) } style={{ color: boxColor }}> { boxName }</span>.
        </p>
      </div>
    );
  if (type === 'userRm')
    return (
      <div className="note-msg">
        <p>
          <i>{ msg[0] }</i>
          <span style={{ color: userColor }}> { userName } </span>
          <i>{ msg[1] }.</i>
        </p>
      </div>
    );
  if (type === 'helloMsg') {
    console.log(msg)
    return (
      <div className="note-msg">
        <p>
          <i>{ msg[0] }</i>
        </p>
      </div>
    );
  }
  return null;
};

export default NoteMessage;
