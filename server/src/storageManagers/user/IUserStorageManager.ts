export default interface IUserStotageManager {
  removeUser(id: number): Promise<void>;
  createUserStorage(id: number): Promise<void>;
  getLogoIfExists(id: number, extraId?: number): Promise<string|null>;
  saveLogo(logo: string, id: number, extraId?: number): Promise<string>;
  removeLogoIfExists(id: number, extraId?: number): Promise<void>;
}
