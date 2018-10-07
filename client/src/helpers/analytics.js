import ReactGA from "react-ga";

export const gameStarted = num => {
  ReactGA.event({
    category: "User",
    action: `started ${num}`
  });
};
export const userBought = () => {
  ReactGA.event({
    category: "User",
    action: "bought"
  });
};
export const userSold = () => {
  ReactGA.event({
    category: "User",
    action: "sold"
  });
};
