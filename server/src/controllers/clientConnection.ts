import ClientDB from '../database/ClientDB';
import IClientDB from '../database/IClientDB';

const clientConnection: IClientDB = new ClientDB();

clientConnection.openPool();

export default clientConnection;
