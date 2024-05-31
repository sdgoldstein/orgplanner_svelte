import {OrgPlannerAppServices} from "./services/orgPlannerAppServices";

/* Initialize services.  This will happen on every refresh of the browser, so client side services should be quick to
 * load/instantiate.  As OrgPLanner is mostly an SPA, this shouldn't run all that often */
OrgPlannerAppServices.initServices();