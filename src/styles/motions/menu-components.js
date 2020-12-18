export const componentMotion = {
  initial: { x: -800 },
  animate: { x: 0 },
  exit: { x: -800 },
  transition: {
    duration: 0.3,
    type: 'tween'
  }  
};

export const descriptionMotion = {
  initial: { y: -400 },
  animate: { y: 0 },
  exit: { y: -400 },
  transition: {
    duration: 0.3
  }  
};

export const pathEntriesMotion = {
  initial: { x: -800 },
  animate: { x: 0 },
  exit: {
    x: -800,
    opacity: 0
  },
  transition: {
    delay: 0.1,
    duration: 0.2,
    type: 'tween'
  }  
}

export const headerMotion = {
  initial: { y: -150 },
  animate: { y: 0 },
  exit: { y: -150 },
  transition: {
    delay: 0.1,
    duration: 0.3
  }  
}

export const menuMotion = {
  initial: { x: -600 },
  animate: { x: 0 },
  exit: { 
    x: -600,
    opacity: 0
   },
  transition: {
    duration: 0.3,
    delay: 0.1,
    type: 'spring'
  }  
};

export const contentMotion = {
  initial: { x: 2000 },
  animate: { x: 0 },
  exit: { x: 2000 },
  transition: {
    type: 'tween'
  }  
};

export const boxToolMotion = {
  initial: {
    y: -50,
    opacity: 0
  },
  animate: {
    y: 0,
    opacity: 1
  },
  exit: {
    y: -50,
    opacity: 0
  } 
};
