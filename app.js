import { h, app, text } from "https://unpkg.com/hyperapp";

const init = {};

// tag, attributes, content
const view = () => h("p", {}, [text("Hello "), h("strong", {}, text("World"))]);

const node = document.getElementById("app");

app({ init, view, node });
