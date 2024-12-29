
import {BaseService, type Service} from "@sphyrna/service-manager-ts";

import {EMPTY_PROPERTY_BAG} from "./orgStructure/orgEntity";
import type {OrgStructure} from "./orgStructure/orgStructure";
import {EmployeeReservedPropertyDescriptors} from "./orgStructure/employee";

interface OrgTemplate
{
    apply(orgStructure: OrgStructure): void;
}

class SimpleOrgTemplate implements OrgTemplate
{
    apply(orgStructure: OrgStructure): void
    {
        orgStructure.createRootTeam("Your Organization");
        orgStructure.createOrgLeader("First Last", "Your Job Title",
                                     new Map([ [ EmployeeReservedPropertyDescriptors.LOCATION, "Your Location" ] ]));
    }
}

class SmallOrgTemplate implements OrgTemplate
{
    apply(orgStructure: OrgStructure): void
    {
        orgStructure.createRootTeam("Your Organization");
        const orgLeader = orgStructure.createOrgLeader(
            "First Last", "Vice President",
            new Map([ [ EmployeeReservedPropertyDescriptors.LOCATION, "Your Location" ] ]));
        orgStructure.createEmployee("Frank Smith", "Senior Manager", orgLeader.id, "NO_TEAM_ID", true,
                                    EMPTY_PROPERTY_BAG);
        orgStructure.createEmployee("Bilbo Baggins", "Engineer", orgLeader.id, "NO_TEAM_ID", false, EMPTY_PROPERTY_BAG);
    }
}

interface OrgTemplateFactoryService extends Service
{
    getTemplate(templateName: string): OrgTemplate;
}

class OrgTemplateFactoryImpl extends BaseService implements OrgTemplateFactoryService
{
    static readonly NAME_TO_TEMPLATE_MAP: Map<string, OrgTemplate> = new Map<string, OrgTemplate>();
    static
    {
        this.NAME_TO_TEMPLATE_MAP.set("simple", new SimpleOrgTemplate());
        this.NAME_TO_TEMPLATE_MAP.set("small", new SmallOrgTemplate());
    }

    getTemplate(templateName: string): OrgTemplate
    {
        const valueToReturn = OrgTemplateFactoryImpl.NAME_TO_TEMPLATE_MAP.get(templateName.toLowerCase());
        if (valueToReturn === undefined)
        {
            throw new Error("Template note found: " + templateName);
        }

        return valueToReturn;
    }
}

export {SimpleOrgTemplate, OrgTemplateFactoryImpl};
export type{OrgTemplate, OrgTemplateFactoryService};
