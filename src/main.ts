import { seedScenario } from "./data/seedScenario.js";
import { renderRootlineDebug } from "./ui/debugView.js";

const app = document.querySelector<HTMLElement>("#app");

if (!app) {
  throw new Error("ROOTLINE debug mount point was not found.");
}

renderRootlineDebug(app, seedScenario);
