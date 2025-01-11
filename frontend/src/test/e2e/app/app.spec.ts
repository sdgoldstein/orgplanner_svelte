import {expect, test} from "@playwright/test";

test.describe("App Tests", () => {
    test("Window Scroll doesn't move header", async ({page}) => {
        await page.goto("/");

        // Find the element you want to check
        const element = page.getByTestId("org_planner_logo_testid");

        // Get the initial position of the element
        const initialPosition =
            await element.evaluate(el => ({x : el.getBoundingClientRect().x, y : el.getBoundingClientRect().y}));

        // Scroll the page
        await test.step("Press New Emplpyee Toolbar Action", async () => {
            await page.evaluate(() => window.scrollTo(0, 500)); // Scroll 500 pixels down
        });

        // Get the position after scrolling
        const positionAfterScroll =
            await element.evaluate(el => ({x : el.getBoundingClientRect().x, y : el.getBoundingClientRect().y}));

        // Check if the position has changed
        expect(positionAfterScroll).toEqual(initialPosition);
    });
});