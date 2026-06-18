import React from "react";
import ReactDOM from "react-dom/client";

//routes import
import App from "./App";

//style import
import "./styles/site.css";
import "./styles/perf-debug.css";

//perf bisection harness (inert without ?perf / ?off= URL flags)
import { applyPerfHarness } from "./lib/perfHarness";
applyPerfHarness();

ReactDOM.createRoot(document.getElementById("root")).render(
  <App />
);
