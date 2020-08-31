const filesReducer = (state, action) => {
  const stateCopy = [ ...state ];
  const closeOpenedFile = () => stateCopy.forEach((x, i) => {
    if (x.opened)
      stateCopy[i].opened = false;
  });
  const actions = {
    FILE_APPEND: () => {
      closeOpenedFile();
      const leftArray = stateCopy.length === 10 ?
        stateCopy.slice(0, -1) : stateCopy;
      return [ action.file, ...leftArray ]
    },
    FILE_CLOSE: () => {
      const { index } = action;
      if (state.length > 1 && state[index].opened) {
        const nextOpened = (index + 1) >= state.length ?
          (index - 1) : (index + 1);
        stateCopy[nextOpened].opened = true;
      }
      const leftL = stateCopy.slice(0, index);
      const leftR = stateCopy.slice(index + 1, state.length);
      return leftL.concat(leftR);
    },
    FILE_OPEN: () => {
      const { index } = action;
      if (index >= state.length)
        return state;
      closeOpenedFile();
      stateCopy[index].opened = true;
      return stateCopy;
    },
    FILE_EDIT: () => {
      const { name, filePath, edited } = action.file;
      return stateCopy.map(file =>
        file.name === name && file.filePath === filePath ?
          { ...file, edited } : file
      );
    },
    FILE_WRITE: () => {
      const { name, filePath, src } = action.file;
      return stateCopy.map(file =>
        file.name === name && file.filePath === filePath ?
          { name, filePath, src, opened: file.opened } : file
      );
    },
    FILES_CANCEL_EDITED: () => {
      stateCopy.forEach(file => delete file.edited);
      return stateCopy;
    },
    FILES_WRITE_ALL: () => {
      const { files } = action;
      return stateCopy.map(f => {
        if (!f)
          return f;
        const [ edited ] = files.filter(fEdited =>
          f.name === fEdited.name &&
          f.filePath === fEdited.filePath
        );
        console.log(edited || f)
        return edited || f;
      });
    }
  };
  const actionType = actions[action.type];
  return actionType ? actionType() : state;
};

export default filesReducer;
