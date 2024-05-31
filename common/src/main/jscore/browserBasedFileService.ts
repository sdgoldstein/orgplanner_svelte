
import {BaseService} from "@sphyrna/service-manager-ts";

import {FileService} from "./fileService";

class BrowserBasedFileService extends BaseService implements FileService
{
    writeFile(filename: string, data: string): Promise<void>
    {

        throw new Error("Method not implemented.");
    }

    readFile(filename: string): Promise<string>{return fetch(filename).then(response => response.text())}

    readFileSync(filename: string): string
    {
        let responseToReturn: string = "";
        const xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200)
            {
                responseToReturn = this.responseText;
            }
        };

        xhttp.open("GET", filename, false);
        xhttp.send();

        return responseToReturn;
    }
}

export {BrowserBasedFileService};