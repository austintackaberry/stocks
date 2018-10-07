import { sheet } from "emotion";
import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import registerServiceWorker from "./registerServiceWorker";
sheet.tags[0] = document.getElementById("MyEmotionSheet");

ReactDOM.render(<App />, document.getElementById("root"));
registerServiceWorker();
