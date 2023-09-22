// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    devtools: { enabled: true },
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
            ],
        },
    },
    css: ["~/assets/global.scss"],
});
