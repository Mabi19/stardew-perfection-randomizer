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
    spaLoadingTemplate: "./spa-loader.html",
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
            meta: [
                { name: "theme-color", content: "#663399" },
                {
                    name: "color-scheme",
                    content: "light dark",
                },
                {
                    name: "description",
                    content:
                        "A Stardew Valley challenge about achieving Perfection one step at a time",
                },
                // Open Graph metedata
                {
                    property: "og:title",
                    // TODO: figure out how to do this with the dynamic title
                    content: "Stardew Perfection Randomizer",
                },
                {
                    property: "og:description",
                    content:
                        "A Stardew Valley challenge about achieving Perfection one step at a time",
                },
                {
                    property: "og:type",
                    content: "website",
                },
                {
                    property: "og:image",
                    content: "/stardew-perfection-randomizer/icon.png",
                },
            ],
            htmlAttrs: {
                lang: "en-US",
            },
        },
    },
    css: ["~/assets/global.scss"],
    modules: ["@pinia/nuxt", "@vite-pwa/nuxt", "@nuxt/test-utils/module"],
    pwa: {
        registerType: "autoUpdate",
        manifest: {
            name: "Stardew Perfection Randomizer",
            short_name: "SDVPR",
            id: "stardew-perfection-randomizer",
            description: "A Stardew Valley challenge about achieving Perfection one step at a time",
            theme_color: "#663399",
            icons: [
                {
                    src: "/stardew-perfection-randomizer/icon.png",
                    sizes: "256x256",
                    type: "image/png",
                    purpose: "any",
                },
                {
                    src: "/stardew-perfection-randomizer/icon-2x.png",
                    sizes: "512x512",
                    type: "image/png",
                    purpose: "any",
                },
                {
                    src: "/stardew-perfection-randomizer/icon-4x.png",
                    sizes: "1024x1024",
                    type: "image/png",
                    purpose: "any",
                },
                {
                    src: "/stardew-perfection-randomizer/icon-maskable.png",
                    sizes: "512x512",
                    type: "image/png",
                    purpose: "maskable",
                },
            ],
        },
    },
});
