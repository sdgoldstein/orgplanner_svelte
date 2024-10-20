import {expect, test} from "@playwright/test";

test("Edit Employee Using Pencil Icon", async ({page}) => {
    await page.goto("/");

    // FIXME - This is super brittle.  Don't know how to fix selector though
    await test.step("Press Pencil Icon", async () => { await page.locator("image").nth(1).click(); });

    await test.step("Enter Employee Information", async () => {
        await page.getByTestId("name_input_testid").fill("Aaron Johnson");
        await page.getByTestId("title_input_testid").fill("Senior Software Engineer");
        await page.getByTestId("team_input_testid").click();
        await page.getByRole("option", {name : "-- No Team --"}).click();
        await page.getByTestId("PHONE_PROPERTY_DESCRIPTOR_input_testid").fill("925-690-9999");
        await page.getByTestId("LOCATION_PROPERTY_DESCRIPTOR_input_testid").fill("Menlo Park");
    });

    await test.step(
        "Submit New Employee form",
        async () => { await page.getByTestId("new_edit_employee_modal_form_id_submit_button_testid").click(); });

    // FIX ME - Need verification
});
