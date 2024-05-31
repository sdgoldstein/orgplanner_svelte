import type {Service} from "@sphyrna/service-manager-ts";

/**
 * Service to fetch data graph
 */
interface DataService extends Service
{
    getData(depth?: number, queryParameters?: Map<string, string>): string;
}

export type {DataService};