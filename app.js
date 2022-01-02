// Full Tutorial: https://github.com/jorgebucaran/hyperapp/blob/main/docs/tutorial.md

// Importing functions h...
import { h, text, app } from "https://cdn.skypack.dev/hyperapp";

// Structure: Tag, Attributes, Content
// const view = () => h("p", {}, [text("Hello "), h("strong", {}, text("World"))]);

// A function is called 'action'
// This particular action keeps all of the state the same, except for highlight, which should be flipped to its opposite
const ToogleHighlight = (state, index) => {
  // make shallow clone of original highlight array
  let highlight = [...state.highlight];

  // flip the highlight value of index in the copy
  highlight[index] = !highlight[index];

  // return shallow copy of our state, replacing
  // the highlight array with our new one
  return { ...state, highlight };
};

// Action for selecting a person
const Select = (state, selected) => [
  { ...state, selected },
  //   [
  //     (dispatch) => {
  //       fetch("https://jsonplaceholder.typicode.com/users/" + state.ids[selected])
  //         .then((response) => response.json())
  //         .then((data) => dispatch(GotBio, data));
  //     },
  //   ],
  jsonFetcher(
    "https://jsonplaceholder.typicode.com/users/" + state.ids[selected],
    GotBio
  ),
];

// Extracting 'person' into seperate component
const person = (props) =>
  // 'h' represents virtual nodes representing HTML tags
  h(
    "div",
    {
      class: {
        person: true,
        highlight: props.highlight,
        selected: props.selected,
      },
      onclick: props.onselect,
    },
    [
      // 'text' creates representations of text nodes
      h("p", {}, text(props.name)),
      h("input", {
        type: "checkbox",
        checked: props.highlight,
        onclick: (_, event) => {
          event.stopPropagation();
          return props.ontoogle;
        },
      }),
      // console.log(props), // {name: 'Max Power', highlight: true, ontoogle: ƒ}
    ]
  );

// Bio Action
const GotBio = (state, data) => ({ ...state, bio: data.company.bs });

const GotNames = (state, data) => ({
  ...state,
  names: data.slice(0, 5).map((x) => x.name),
  ids: data.slice(0, 5).map((x) => x.id),
  highlight: [false, false, false, false, false],
});

const fetchJson = (dispatch, options) => {
  fetch(options.url)
    .then((response) => response.json())
    .then((data) => dispatch(options.action, data));
};

const jsonFetcher = (url, action) => [fetchJson, { url, action }];

const SelectUp = (state) => {
  if (state.selected === null) return state;
  return [Select, state.selected - 1];
};

const SelectDown = (state) => {
  if (state.selected === null) return state;
  return [Select, state.selected + 1];
};

// If the event key matches options.key we will dispatch options.action
const keydownSubscriber = (dispatch, options) => {
  const handler = (ev) => {
    if (ev.key !== options.key) return;
    dispatch(options.action);
  };
  addEventListener("keydown", handler);
  return () => removeEventListener("keydown", handler);
};

// Subscription Creator
const onKeyDown = (key, action) => [keydownSubscriber, { key, action }];

app({
  // Initialize the app with 'state' parameters below
  //   init: {
  //     names: [
  //       "Max Power",
  //       "Serena Rocha",
  //       "Stacy Howard",
  //       "Hallie Moon",
  //       "Lesa James",
  //     ],
  //     highlight: [false, true, false, true, false],
  //     selected: null,
  //     bio: "",
  //     ids: [1, 2, 3, 4, 5],
  //   },
  init: [
    { names: [], highlight: [], selected: null, bio: "", ids: [] },
    jsonFetcher("https://jsonplaceholder.typicode.com/users", GotNames),
  ],
  // 'view' function returns virtual DOM
  view: (state) =>
    h("main", {}, [
      //   console.log(...state.names), // {names: Array(5), highlight: Array(5)}
      ...state.names.map((name, index) =>
        person({
          name: name,
          highlight: state.highlight[index],
          // 'index' becomes second argument to the 'ToggleHighlight' action
          ontoogle: [ToogleHighlight, index],
          selected: state.selected === index,
          onselect: [Select, index],
        })
      ),
      // Conditional Rendering
      state.bio && h("div", { class: "bio" }, text(state.bio)),
    ]),
  // 'node' declares where ont he page we want to render our app
  node: document.getElementById("app"),
  // Subscription
  subscriptions: (state) => [
    state.selected !== null &&
      state.selected > 0 &&
      onKeyDown("ArrowUp", SelectUp),

    state.selected !== null &&
      state.selected < state.ids.length - 1 &&
      onKeyDown("ArrowDown", SelectDown),
  ],
});
