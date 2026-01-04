// types/busboy.d.ts
declare module "busboy" {
  import { IncomingHttpHeaders } from "http";
  import { Readable } from "stream";

  export interface BusboyConfig {
    headers: IncomingHttpHeaders;
    defCharset?: string;
    defParamCharset?: string;
    highWaterMark?: number;
    fileHwm?: number;
    preservePath?: boolean;
    limits?: {
      fieldNameSize?: number;
      fieldSize?: number;
      fields?: number;
      fileSize?: number;
      files?: number;
      parts?: number;
      headerPairs?: number;
    };
  }

  export interface FileInfo {
    filename: string;
    encoding: string;
    mimeType: string;
  }

  export type BusboyEvents = {
    file: (fieldname: string, stream: Readable, info: FileInfo) => void;
    field: (fieldname: string, value: string, info: { nameTruncated: boolean; valueTruncated: boolean; encoding: string; mimeType: string }) => void;
    finish: () => void;
    error: (err: Error) => void;
  };

  export default class Busboy extends Readable {
    constructor(config: BusboyConfig);
    on<U extends keyof BusboyEvents>(event: U, listener: BusboyEvents[U]): this;
  }
}
