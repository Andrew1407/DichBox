import React from 'react';
import { useHistory } from 'react-router-dom';

const NoteMessage = ({ type, userName, userColor, boxName, boxColor, msg }) => {
  const history = useHistory();
  const handleRouteMove = (user, box = '') => e => {
    e.preventDefault();
    let route = `/${user}`;
    if (box) route += `/${box}`;
    history.push(route);
  };

  const msgTemplates = {};
  msgTemplates['((viewer|editor)(Add|Rm))'] = (
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
  msgTemplates['boxAdd'] = (
    <div className="note-msg">
      <p>
        <i>{ msg[0] }</i>
        <span onClick={ handleRouteMove(userName) } style={{ color: userColor }}> { userName } </span>
        <i>{ msg[1] }</i>
        <span onClick={ handleRouteMove(userName, boxName) } style={{ color: boxColor }}> { boxName }</span>.
      </p>
    </div>
  );
  msgTemplates['userRm'] = (
    <div className="note-msg">
      <p>
        <i>{ msg[0] + ' (' }</i> 
        <span style={{ color: userColor }}>{ userName }</span>
        <i>{ ') ' + msg[1] }.</i>
      </p>
    </div>
  );
  msgTemplates['helloMsg'] = (
    <div className="note-msg">
      <p><i>{ msg[0] }</i></p>
    </div>
  );

  for (const msgType in msgTemplates) {
    const msgExp = new RegExp(`^${msgType}$`);
    if (msgExp.test(type))
      return msgTemplates[msgType];
  } 
  
  return (<div><p><i>Invalid notification</i></p></div>);
};

export default NoteMessage;
