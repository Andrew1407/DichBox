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
      closeOpenedFile();
      stateCopy[index].opened = true;
      return stateCopy;
    },
  };
  const actionType = actions[action.type];
  return actionType ? actionType() : state;
};

export default filesReducer;
