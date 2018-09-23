import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Play from "./pages/Play/Play";

const App = () => (
  <Router>
    <div>
      <Route exact path="/" component={Home} />
      <Route path="/play" component={Play} />
    </div>
  </Router>
);
export default App;
