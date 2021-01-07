export default interface IStorageManager {
  getLogoIfExists(id: number, extraId?: number): Promise<string|null>;
  saveLogo(logo: string, id: number, extraId?: number): Promise<string>;
  removeLogoIfExists(id: number, extraId?: number): Promise<void>;
}
