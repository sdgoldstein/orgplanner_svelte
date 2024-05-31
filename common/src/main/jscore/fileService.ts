import {Service} from "@sphyrna/service-manager-ts";

export interface FileService extends Service {
    writeFile(filename: string, data: string): Promise<void>;
    readFile(filename: string): Promise<string>;
    readFileSync(filename: string): string;
}
