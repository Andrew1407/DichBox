import * as http from 'http';
import * as dotenv from 'dotenv';

dotenv.config();

type headersType = {
  'Content-Type': string,
  'Constent-Length': number
};

type requestOptions = {
  host: string,
  port: number,
  method: string,
  path: string,
  headers: headersType
};

type responseType = {
  status: number|null,
  body: unknown|null
};

type responsePromise = (val: responseType) => void;
type clientRequestClb = (clientRes: http.IncomingMessage) => void;
type queryType = (route: string, body?: unknown|null) => Promise<responseType>;

const makeRequest: queryType = (route, body = null) => new Promise(
  (res: responsePromise): void => {
    const bodyStringified: string = JSON.stringify(body);
    const headers: headersType = {
      'Content-Type': 'application/json',
      'Constent-Length': Buffer.byteLength(bodyStringified)
    };
    const options: requestOptions = {
      host: process.env.HOST || 'localhost',
      port: Number(process.env.PORT) || 7041,
      method: 'POST',
      path: route,
      headers
    };
    const responseBody: responseType = {
      status: null,
      body: null
    };
    const bodyChunks: Buffer[] = [];
    const dataHandler = (chunk: Buffer): void => {
      bodyChunks.push(chunk);
    };
    const closeHandler = (): void => {
      const bodyFull: Buffer = Buffer.concat(bodyChunks);
      responseBody.body = JSON.parse(bodyFull.toString());
      res(responseBody);
    };
    const requestClb: clientRequestClb = clientRes => {
      responseBody.status = clientRes.statusCode;
      clientRes
        .on('data', dataHandler)
        .on('close', closeHandler);
    };
    const clientRequest: http.ClientRequest = http.request(options, requestClb);
    clientRequest.end(bodyStringified);
  }
);

export default makeRequest;
