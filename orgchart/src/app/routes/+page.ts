import {DefaultServiceManagerStrategyImpl, ServiceManager} from "@sphyrna/service-manager-ts";
import type {PageLoad} from "./$types";
import {SERIALIZATION_SERVICE_NAME, SerializationServiceImpl} from "orgplanner-common/jscore";

export const ssr = false;

export const load: PageLoad = async ({fetch}) => {
    const serviceManagerStrategy = new DefaultServiceManagerStrategyImpl();
    serviceManagerStrategy.registerSingletonService(SERIALIZATION_SERVICE_NAME, SerializationServiceImpl);
    ServiceManager.setDefaultStrategy(serviceManagerStrategy);

    const response = await fetch("mock_org_list.txt");
    const orgListText = await response.text();
    const orgList = orgListText.split("\n").filter(line => line.trim() !== "");

    return {orgList : orgList};
};