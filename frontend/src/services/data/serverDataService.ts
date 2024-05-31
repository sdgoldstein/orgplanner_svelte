import {BaseService} from "../framework/Service";

import {DataService} from "./dataService";

/**
 * Service to fetch data graph from the server
 */
class ServerDataService extends BaseService implements DataService
{
    getData(depth?: number|undefined, queryParameters?: Map<string, string>|undefined): string
    {
        const httpRequest = new XMLHttpRequest();

        let result: string = "";
        httpRequest.onreadystatechange = function(): void {
            if (this.readyState === XMLHttpRequest.DONE)
            {
                if (this.status === 200)
                {
                    result = httpRequest.responseText;
                }
                else
                {
                    // FIXME
                    alert(httpRequest.responseText);
                }
            }
        };

        let url = '/import?';

        if (queryParameters && queryParameters.has("leaderId"))
        {
            const leaderId = queryParameters.get("leaderId");
            url += 'leaderId=' + leaderId + '&';
        }

        url += 'depth=' + depth;
        httpRequest.open('GET', url, false);
        httpRequest.send();

        return result;
    }
}

export {ServerDataService};