// types/busboy.d.ts
declare module "busboy" {
  import { IncomingHttpHeaders } from "http";
  import { Writable } from "stream";

  export interface BusboyConfig {
    headers: IncomingHttpHeaders;
    // … other options …
  }

  export interface FileInfo {
    filename: string;
    encoding: string;
    mimeType: string;
  }

  export default class Busboy extends Writable {
    constructor(config: BusboyConfig);
    on(event: "file", listener: (fieldname: string, stream: NodeJS.ReadableStream, info: FileInfo) => void): this;
    on(event: "field", listener: (fieldname: string, value: string) => void): this;
    on(event: "finish", listener: () => void): this;
    on(event: "error", listener: (err: Error) => void): this;
  }
}
