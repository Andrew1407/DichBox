const filesReducer = (state, action) => {
  const stateCopy = [ ...state ];
  const closeOpenedFile = () => stateCopy.forEach((x, i) => {
    if (x.opened)
      stateCopy[i].opened = false;
  });
  const actions = {
    FILE_APPEND: () => {
      const { file } = action;
      const foundFiles = stateCopy.filter(f =>
        f && file.name === f.name && file.filePath === `/${f.filePath}`
      );
      if (foundFiles.length) return state;
      closeOpenedFile();
      const leftArray = stateCopy.length === 10 ?
        stateCopy.slice(0, -1) : stateCopy;
      return [ action.file, ...leftArray ]
    },
    FILE_CLOSE: () => {
      const index = Number(action.index);
      if (!state[index] || index < 0 || index >= state.length)
        return state;
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
        if (!f) return f;
        const [ edited ] = files.filter(fEdited =>
          f.name === fEdited.name &&
          f.filePath === fEdited.filePath
        );
        return edited || f;
      });
    },
    FILES_CLOSE_ALL: () => [],
    FILE_RENAME: () => {
      const index = Number(action.index);
      const { name } = action;
      if (!state[index] || index < 0 || index >= state.length)
        return state;
      return stateCopy.map((f, i) => (
        i === index ? ({ ...f, name }) : f
      ));
    },
    FILES_RENAME_PATH: () => {
      const { oldPath, newPath } = action;
      return stateCopy.map(f => {
        if (!f.filePath.startsWith(oldPath)) return f;
        const filePath = newPath + f.filePath.slice(oldPath.length);
        return { ...f, filePath }; 
      });
    },
    FILES_CLOSE_BY_PATH: () => {
      const { dirPath } = action;
      const rightPaph = dirPath[0] === '/' ? 
        dirPath : '/' + dirPath;
      const filtered = stateCopy.filter(f => 
        !f.filePath.startsWith(rightPaph)
      );
      if (!filtered.length) return [];
      const isOpened = filtered.reduce(((res, f) => 
        res || f.opened
      ), false);
      if (isOpened) return filtered;
      filtered[0].opened = true;
      return filtered;
    } 
  };
  const actionType = actions[action.type];
  return actionType ? actionType() : state;
};

export default filesReducer;
