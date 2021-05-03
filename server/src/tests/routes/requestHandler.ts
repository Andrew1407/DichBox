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
  status: number,
  body: unknown
};

type responsePromise = (val: responseType) => void;
type clientRequestClb = (clientRes: http.IncomingMessage) => Promise<void>;
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
    const requestClb: clientRequestClb = async clientRes => {
      const bodyChunks: Buffer[] = [];
      for await (const chunk of clientRes) bodyChunks.push(chunk);
      const bodyFull: Buffer = Buffer.concat(bodyChunks);
      const responseBody: responseType = {
        status: clientRes.statusCode,
        body: JSON.parse(bodyFull.toString())
      };
      res(responseBody);
    };
    const clientRequest: http.ClientRequest = http.request(options, requestClb);
    clientRequest.end(bodyStringified);
  }
);

export default makeRequest;
