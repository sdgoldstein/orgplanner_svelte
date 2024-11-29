import * as em from "events";
import * as fs from "fs";
import * as util from "util";

import type {FileService} from "./fileService";
import {BaseService} from "@sphyrna/service-manager-ts";

class NodeBasedFileService extends BaseService implements FileService
{
    readFileSync(filename: string): string
    {
        return fs.readFileSync(filename).toString();
    }

    writeFile(filename: string, data: string): Promise<void>
    {
        const writeFileWithPromise: (path: string, data: string) => Promise<void> = util.promisify(fs.writeFile);
        return writeFileWithPromise(filename, data);
    }

    readFile(filename: string): Promise<string>
    {
        const readFileWithPromise: (path: fs.PathOrFileDescriptor, options: ({
                                        encoding: BufferEncoding;
                                        flag?: string|undefined;
                                    }&em.Abortable)|BufferEncoding) => Promise<string> = util.promisify(fs.readFile);
        return readFileWithPromise(filename, "utf-8");
    }
}

export {NodeBasedFileService};
