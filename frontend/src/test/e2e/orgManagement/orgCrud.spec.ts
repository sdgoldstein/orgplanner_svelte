import {expect, test} from "@playwright/test";

test("Create New Organization", async ({page}) => {
    await page.goto("/");
    await test.step("Press New action element",
                    async () => { await page.getByTestId("new_org_main_nav_item_testid").click(); });

    await test.step("Enter Org Information",
                    async () => { await page.getByTestId("new_org_title_input_testid").fill("The Greatest Org"); });

    await test.step("Submit New Org form",
                    async () => { await page.getByTestId("new_org_modal_submit_button_el_testid").click(); });

    // FIX ME - Need verification
});
