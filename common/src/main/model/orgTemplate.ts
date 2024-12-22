
import {BaseService, type Service} from "@sphyrna/service-manager-ts";

import {EMPTY_PROPERTY_BAG} from "./orgStructure/orgEntity";
import type {OrgStructure} from "./orgStructure/orgStructure";

interface OrgTemplate
{
    apply(orgStructure: OrgStructure): void;
}

class SimpleOrgTemplate implements OrgTemplate
{
    apply(orgStructure: OrgStructure): void
    {
        orgStructure.createRootTeam("FIX ME");
        orgStructure.createOrgLeader("First Last", "Senior Vice President", EMPTY_PROPERTY_BAG);
    }
}

class SmallOrgTemplate implements OrgTemplate
{
    apply(orgStructure: OrgStructure): void
    {
        orgStructure.createRootTeam("FIX ME");
        const orgLeader = orgStructure.createOrgLeader("Steve Johnson", "Senior Vice President", EMPTY_PROPERTY_BAG);
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
        this.NAME_TO_TEMPLATE_MAP.set("Simple", new SimpleOrgTemplate());
        this.NAME_TO_TEMPLATE_MAP.set("Small", new SmallOrgTemplate());
    }

    getTemplate(templateName: string): OrgTemplate
    {
        const valueToReturn = OrgTemplateFactoryImpl.NAME_TO_TEMPLATE_MAP.get(templateName);
        if (valueToReturn === undefined)
        {
            throw new Error("Template note found: " + templateName);
        }

        return valueToReturn;
    }
}

export {SimpleOrgTemplate, OrgTemplateFactoryImpl};
export type{OrgTemplate, OrgTemplateFactoryService};
