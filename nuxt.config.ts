// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    devtools: { enabled: true },
    ssr: false,
    app: {
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
            ],
        },
    },
    css: ["~/assets/global.scss"],
    modules: ["@pinia/nuxt"],
});
