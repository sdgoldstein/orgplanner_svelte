import {devices, type PlaywrightTestConfig} from "@playwright/test";

const config: PlaywrightTestConfig = {
    webServer : {command : "npm run build && npm run preview", port : 4173},
    testDir : "src/test/e2e",
    testMatch : /(.+\.)?(test|spec)\.[jt]s/,
    projects : [
        {
            name : "brave",
            use : {
                ...devices["Desktop Brave"],
                headless : false,
                launchOptions : {
                    // in CI, using linux: "e2e/install-brave-browser.sh"
                    // but in local need to install it manually: https://brave.com/download/
                    executablePath : process.env.CI ? "/usr/bin/brave-browser"
                                                    : "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
                }
            }
        },
    ],
};

export default config;
