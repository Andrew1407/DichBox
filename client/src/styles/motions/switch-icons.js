export const hideMenuMotion = {
  whileHover: {
    x: [0, -10, 0, -8, 0, -6, 0, -3, 0]
  },
  transition: {
    duration: 1.1
  }  
};

export const showMenuMotion = {
  initial: {
    opacity: 0
  },
  animate: {
    opacity: 1
  },
  whileHover: {
    x: [0, 10, 0, 8, 0, 6, 0, 3, 0]
  },
  transition: {
    delay: 0.1,
    duration: 1.1
  }  
};

export const bounceDownMotion = {
  initial: {
    opacity: 0
  },
  animate: {
    opacity: 1
  },
  whileHover: {
    y: [0, 10, 0, 8, 0, 6, 0, 3, 0]
  },
  transition: {
    duration: 1.1
  }  
};
