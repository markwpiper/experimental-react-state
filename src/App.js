import React, { useReducer } from "react";
import "./styles.css";

// EXPERIMENT: use a Proxy object to detect changes to state, instead of having to do useState and call the setter
// WORKS: not sure why it proxies twice on startup, and renders twice every time, but... so does React normally!
// and I once got it to trigger huge amounts of onChange callbacks... migiht be renderinig untli the renders are the same ms?
const onChange = require("on-change");

const proxies = new WeakSet();
let r = 0;
let fu = null;

function state(s) {
  let i = 0;
  let updater = { forceUpdate: null };
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0);
  console.log("fu", Object.is(fu, forceUpdate));
  fu = forceUpdate;
  //let [rvn, setRvn] = React.useState(0);
  let [s2, setS2] = React.useState(s); // stores s
  let s2IsProxy =
    proxies.has(s2) || proxies.has(setS2) || proxies.has(forceUpdate);
  updater.forceUpdate = forceUpdate;
  console.log(`state isProxy=${s2IsProxy}`, s2);
  if (s2IsProxy) {
    return s2;
  } else {
    proxies.add(forceUpdate);
    console.log("@ Proxy!", s2);
    const proxy = onChange(s2, function(path, value, previousValue) {
      console.log("Object changed:", ++i);
      console.log("this:", this);
      console.log("path:", path);
      console.log("value:", value);
      console.log("previousValue:", previousValue);
      updater.forceUpdate();
    });
    proxies.add(proxy);
    setS2(proxy);
    //updater.setRvn(Date.now());
    proxies.add(proxy);
    return proxy;
  }
}

export default function App() {
  return (
    <div className="App">
      <MyComponent title="a" />
    </div>
  );
}

function MyComponent({ title }) {
  console.log(`---Render ${r++}----`);
  let s = state({ a: 1 });
  let onClick = () => {
    s.a++;
  };
  return (
    <div>
      {title}={s.a}
      <button onClick={onClick}>Foo</button>
    </div>
  );
}
