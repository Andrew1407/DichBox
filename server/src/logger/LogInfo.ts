export default interface LogInfo {
  date: string,
  method: string,
  route: string,
  status: number,
  errorMessage?: string
  errorMessageInternal?: string
};
