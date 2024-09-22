import {expect, test} from "@playwright/test";

test("Create New Employee using Toolbar Action", async ({page}) => {
    await page.goto("/");
    await test.step("Press New Emplpyee Toolbar Action", async () => {});

    await test.step("Enter Employee Information", async () => {});

    await test.step("Submit New Employee form", async () => {});

    // FIX ME - Need verification
});
