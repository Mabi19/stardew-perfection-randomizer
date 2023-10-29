import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

const packageJSON = readFileSync("./package.json", "utf-8");
const packageInfo = JSON.parse(packageJSON);

const commitID = execSync('git log --format="%H" -n 1').toString("utf8").slice(0, 7);

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    devtools: { enabled: true },
    ssr: false,
    appConfig: {
        version: packageInfo.version,
        buildID: commitID,
    },
    app: {
        baseURL: "/stardew-perfection-randomizer/",
        head: {
            link: [
                { rel: "preconnect", href: "https://fonts.googleapis.com" },
                {
                    rel: "preconnect",
                    href: "https://fonts.gstatic.com",
                    crossorigin: "",
                },
                {
                    href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;700&display=swap",
                    rel: "stylesheet",
                },
                {
                    href: "https://fonts.googleapis.com/icon?family=Material+Icons",
                    rel: "stylesheet",
                },
                {
                    href: "/stardew-perfection-randomizer/icon.png",
                    rel: "icon",
                },
            ],
        },
    },
    css: ["~/assets/global.scss"],
    modules: ["@pinia/nuxt"],
});
