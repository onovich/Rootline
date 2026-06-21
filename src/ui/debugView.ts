import type { CaveNode, WorldSnapshot } from "../sim/types.js";
import { getOpenNeighbors, summarizeWorld } from "../sim/world.js";

export function renderRootlineDebug(
  mount: HTMLElement,
  world: WorldSnapshot,
): void {
  mount.replaceChildren();

  const summary = summarizeWorld(world);

  const shell = document.createElement("div");
  shell.className = "debug-shell";

  shell.append(
    renderHeader(world.seed, world.tick),
    renderMetrics([
      ["Nodes", summary.nodeCount],
      ["Open edges", summary.openEdgeCount],
      ["Visible", summary.visibleNodeCount],
      ["Factions", summary.factionCount],
    ]),
    renderMainGrid(world),
  );

  mount.append(shell);
}

function renderHeader(seed: number, tick: number): HTMLElement {
  const header = document.createElement("header");
  header.className = "debug-header";

  const titleGroup = document.createElement("div");
  const title = document.createElement("h1");
  title.textContent = "ROOTLINE";

  const subtitle = document.createElement("p");
  subtitle.textContent = "Simulation debug surface";

  titleGroup.append(title, subtitle);

  const state = document.createElement("div");
  state.className = "run-state";
  state.append(metricText("Seed", seed), metricText("Tick", tick));

  header.append(titleGroup, state);
  return header;
}

function renderMetrics(entries: Array<[string, number]>): HTMLElement {
  const metrics = document.createElement("section");
  metrics.className = "metrics";

  for (const [label, value] of entries) {
    const item = document.createElement("div");
    item.className = "metric";
    item.append(metricText(label, value));
    metrics.append(item);
  }

  return metrics;
}

function renderMainGrid(world: WorldSnapshot): HTMLElement {
  const grid = document.createElement("section");
  grid.className = "main-grid";
  grid.append(renderGraph(world), renderNodeList(world), renderFactions(world));
  return grid;
}

function renderGraph(world: WorldSnapshot): HTMLElement {
  const panel = panelElement("Cave Graph");
  const graph = document.createElement("pre");
  graph.className = "ascii-map";
  graph.textContent = [
    "         [Echo Vault]",
    "              | open",
    "[Sealed Vein] x blocked",
    "              |",
    "       [Rootwell Atrium] -- open -- [Spore Market]",
  ].join("\n");

  const edgeList = document.createElement("ul");
  edgeList.className = "edge-list";

  for (const edge of world.edges) {
    const item = document.createElement("li");
    item.textContent = `${edge.from} -> ${edge.to}: ${edge.state}`;
    item.dataset.state = edge.state;
    edgeList.append(item);
  }

  panel.append(graph, edgeList);
  return panel;
}

function renderNodeList(world: WorldSnapshot): HTMLElement {
  const panel = panelElement("Caverns");
  const list = document.createElement("div");
  list.className = "node-list";

  for (const node of world.nodes) {
    list.append(renderNodeCard(node, world));
  }

  panel.append(list);
  return panel;
}

function renderNodeCard(node: CaveNode, world: WorldSnapshot): HTMLElement {
  const card = document.createElement("article");
  card.className = "node-card";
  card.dataset.visibility = node.visibility;

  const title = document.createElement("h3");
  title.textContent = node.name;

  const meta = document.createElement("p");
  meta.textContent = `${node.visibility} | stability ${node.stability}`;

  const resources = document.createElement("p");
  resources.textContent = `food ${node.resources.food} / oxygen ${node.resources.oxygen} / heat ${node.resources.heat}`;

  const neighbors = document.createElement("p");
  neighbors.textContent = `open neighbors: ${formatNeighborNames(node.id, world)}`;

  card.append(title, meta, resources, neighbors);
  return card;
}

function renderFactions(world: WorldSnapshot): HTMLElement {
  const panel = panelElement("Factions");
  const list = document.createElement("div");
  list.className = "faction-list";

  for (const faction of world.factions) {
    const item = document.createElement("article");
    item.className = "faction-card";

    const name = document.createElement("h3");
    name.textContent = faction.name;

    const home = document.createElement("p");
    home.textContent = `home: ${faction.homeNodeId}`;

    const belief = document.createElement("p");
    belief.textContent = faction.belief;

    item.append(name, home, belief);
    list.append(item);
  }

  const log = document.createElement("ol");
  log.className = "event-log";

  for (const event of world.events) {
    const item = document.createElement("li");
    item.textContent = event;
    log.append(item);
  }

  panel.append(list, log);
  return panel;
}

function panelElement(titleText: string): HTMLElement {
  const panel = document.createElement("section");
  panel.className = "panel";

  const title = document.createElement("h2");
  title.textContent = titleText;
  panel.append(title);

  return panel;
}

function metricText(label: string, value: number): HTMLElement {
  const group = document.createElement("span");
  group.className = "metric-text";

  const labelElement = document.createElement("span");
  labelElement.textContent = label;

  const valueElement = document.createElement("strong");
  valueElement.textContent = String(value);

  group.append(labelElement, valueElement);
  return group;
}

function formatNeighborNames(nodeId: string, world: WorldSnapshot): string {
  const neighbors = getOpenNeighbors(world, nodeId).map((node) => node.name);
  return neighbors.length > 0 ? neighbors.join(", ") : "none";
}
