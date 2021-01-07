interface Statuses {
  OK: 200,
  SERVER_INTERNAL: 500,
  NOT_FOUND: 404,
  CREATED: 201,
  BAD_REQUEST: 400,
  FORBIDDEN: 403
};

interface ErrorMessages {
  USER_INVAID_REQUEST: string,
  USER_NOT_FOUND: string,
  FORBIDDEN: string,
  SUBSCRIPTIONS_NOT_FOUND: string,
  BOXES_NOT_FOUND: string,
  BOXES_INVAID_REQUEST: string,
  DIR_NOT_FOUND: string,
  INVALID_PATH: string,
  BOXES_INTERNAL: string,
  FILES_NOT_FOUND: string,
  SERVER_INTERNAL: string,
  INVALID_PASSWORD: string
};

export const statuses: Statuses = {
  OK: 200,
  SERVER_INTERNAL: 500,
  NOT_FOUND: 404,
  CREATED: 201,
  BAD_REQUEST: 400,
  FORBIDDEN: 403
};

export const errMessages: ErrorMessages = {
  USER_INVAID_REQUEST: 'We just can\'t sign you up!',
  USER_NOT_FOUND: 'The searched digital twin wasn\'t found in the DichBox system...',
  FORBIDDEN: 'Forbidden for you!!!',
  SUBSCRIPTIONS_NOT_FOUND: 'Nothing was found for you...',
  BOXES_NOT_FOUND: 'No box, no files, no directories... Nothing... Just nothing...',
  BOXES_INVAID_REQUEST: 'Well, invalid data...',
  DIR_NOT_FOUND: 'Nothing is here. No files, no directories...',
  INVALID_PATH: 'This path has led you to nowhere...',
  BOXES_INTERNAL: 'Very big problems with the DichBox server.',
  FILES_NOT_FOUND: 'Wrong names, no data for you...',
  SERVER_INTERNAL: 'It\'s a secret, but something terrible happened on the DichBox server...',
  INVALID_PASSWORD: 'Invalid password'
};
