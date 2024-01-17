export default defineNitroPlugin((nitroApp) => {
    nitroApp.hooks.hook("render:html", (html) => {
        // Put a special tag for modals to slot themselves into.
        // This is used so that they can be hidden by the overlay hack
        // (see TemplateEditor.vue for details)
        html.body.push(`<div id="modals"></div>`);
    });
});
