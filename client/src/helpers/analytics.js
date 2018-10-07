import ReactGA from "react-ga";

export const userInitiatedStart = () => {
  ReactGA.event({
    category: "User",
    action: "User initiated game start"
  });
};
export const userBought = () => {
  ReactGA.event({
    category: "User",
    action: "User bought stock"
  });
};
export const userSold = () => {
  ReactGA.event({
    category: "User",
    action: "User sold stock"
  });
};
