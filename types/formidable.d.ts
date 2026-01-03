// types/formidable.d.ts
declare module "formidable" {
  import { EventEmitter } from "events";
  import { IncomingMessage } from "http";

  export interface File {
    originalFilename?: string | null;
    newFilename?: string;
    filepath: string;
    size: number;
    mimetype?: string | null;
    lastModifiedDate?: Date | null;
  }

  export interface Fields {
    [key: string]: string | string[];
  }

  export interface Files {
    [key: string]: File | File[];
  }

  export interface Options {
    uploadDir?: string;
    keepExtensions?: boolean;
    multiples?: boolean;
  }

  export class IncomingForm extends EventEmitter {
    constructor(options?: Options);
    parse(
      req: IncomingMessage,
      callback: (err: any, fields: Fields, files: Files) => void
    ): void;
  }

  const formidable: (options?: Options) => IncomingForm;
  export default formidable;
  export { File, Fields, Files, Options, IncomingForm };
}
