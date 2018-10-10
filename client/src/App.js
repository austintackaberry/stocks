import React from "react";
import { Router, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Play from "./pages/Play/Play";
import createBrowserHistory from "history/createBrowserHistory";
import ReactGA from "react-ga";
ReactGA.initialize("UA-112850376-2", { titleCase: false, debug: true });

const history = createBrowserHistory();

// Triggers ga page view for initial load
ReactGA.pageview(window.location.pathname + window.location.search);

// Triggers ga page view for all subsequent loads
history.listen(location =>
  ReactGA.pageview(location.pathname + location.search)
);

const App = () => (
  <Router history={history}>
    <div>
      <Route exact path="/" component={Home} />
      <Route path="/play" component={Play} />
    </div>
  </Router>
);
export default App;
