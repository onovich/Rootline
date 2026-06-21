# ROOTLINE Phase 2 洞穴图与 Tick 模拟核心架构设计

## 1. Objective

Phase 2 的目标是把 Phase 1 的 TypeScript Web debug skeleton 扩展成可验证的 deterministic simulation core：洞穴图可以被查询和修改，tick 能以固定顺序推进，资源会沿开放边流动，低稳定性会触发坍塌事件，并且同一 seed 的模拟结果可复现。

本阶段的架构成功标准：

> 一个拓扑变化必须能改变资源、稳定性或事件历史，并且这种变化能被测试和 debug UI 同时观察到。

## 2. Non-Goals

Phase 2 不做以下内容：

- 不做完整 CRPG 操作界面。
- 不做角色选择、角色成长、装备或对话树。
- 不做复杂派系 AI，只保留派系数据和事件可读性。
- 不做战斗系统。
- 不做 AI 内容生成。
- 不做最终美术或 sprite 渲染。
- 不引入大型前端框架或状态管理库。
- 不做持久化存档格式，除非作为测试用快照辅助。

## 3. Required Context

执行程序必须先阅读：

- `docs/ROOTLINE_Game_Design_Document.md`
- `docs/ROOTLINE_Technical_Design_Document.md`
- `docs/ROOTLINE_Project_Plan.md`
- `docs/ROOTLINE_Development_Roadmap_CN.md`
- `README.md`
- `src/sim/types.ts`
- `src/sim/world.ts`
- `src/data/seedScenario.ts`
- `src/ui/debugView.ts`
- `src/tests/world.test.ts`

当前代码状态：

- Phase 1 已完成 TypeScript Web debug skeleton。
- `src/sim` 是 simulation truth。
- `src/data` 存放手写 seed scenario。
- `src/ui` 渲染 debug surface。
- `npm run verify` 已能完成类型检查、测试和构建。

## 4. Session Role and Routing Decision

当前会话角色：`架构师`。

本文件是架构计划，不是实现提交。它为后续 `执行程序` 使用 `$do-next-goal` 分轮实现 Phase 2 提供数据契约、模块边界、验收标准和交接 prompt。

本地文档路径：

`docs/ROOTLINE_Phase_2_Architecture_Design_CN.md`

## 5. Design or Architecture Constraints

### 5.1 Simulation First

Simulation core 是世界事实来源。UI 只能读取 `WorldSnapshot` 或派生 view model，不得直接拥有或修改世界规则。

禁止：

- 在 `src/ui` 中实现资源流动、稳定性变化、坍塌判定。
- 在 debug view 中硬编码会随世界状态变化的图结构。
- 让 DOM 状态成为模拟状态来源。

### 5.2 Deterministic by Default

所有会改变世界的函数必须可复现。

要求：

- 所有随机行为必须通过显式 RNG state 或 seed 派生。
- tick 函数输入相同，输出必须相同。
- 事件顺序必须稳定。
- 测试必须覆盖同 seed 重跑一致性。

### 5.3 Pure Core, Thin UI

优先使用纯函数处理模拟：

- 输入：`WorldSnapshot` + command 或 tick options。
- 输出：新的 `WorldSnapshot`。
- 不在 sim core 中读写 DOM、localStorage、网络或时间。

### 5.4 Explicit Data Contracts

Phase 1 的 `occupants: string[]` 语义含糊，Phase 2 必须收口。

推荐改为：

```ts
export interface CaveNode {
  id: string;
  name: string;
  resources: ResourceStock;
  stability: number;
  factionIds: string[];
  npcIds: string[];
  visibility: Visibility;
}
```

如果执行程序认为需要更通用引用，可提出 `OccupantRef`，但必须先在本阶段文档或代码注释中解释原因。不要继续使用含糊的 `occupants: string[]`。

### 5.5 Data-Driven Debug Surface

`src/ui/debugView.ts` 当前 ASCII graph 是硬编码。Phase 2 第一轮必须改成数据驱动：

- 边列表来自 `world.edges`。
- 节点展示来自 `world.nodes`。
- graph overview 可以先是文本邻接表，不要求精美布局。
- UI 展示的连接状态必须和 sim core 一致。

## 6. Data, Content, and Module Design

### 6.1 Core Types

建议扩展 `src/sim/types.ts`：

```ts
export type ResourceKey = "food" | "oxygen" | "heat";
export type ResourceStock = Record<ResourceKey, number>;
export type Visibility = "unknown" | "known" | "visited";
export type EdgeState = "open" | "blocked" | "collapsed";

export interface CaveNode {
  id: string;
  name: string;
  resources: ResourceStock;
  stability: number;
  factionIds: string[];
  npcIds: string[];
  visibility: Visibility;
}

export interface CaveEdge {
  id: string;
  from: string;
  to: string;
  state: EdgeState;
  traversalCost: number;
  stabilityStress: number;
}

export interface SimulationEvent {
  id: string;
  tick: number;
  type: SimulationEventType;
  message: string;
  nodeIds?: string[];
  edgeIds?: string[];
  factionIds?: string[];
}

export interface WorldSnapshot {
  tick: number;
  seed: number;
  rngState: number;
  nodes: CaveNode[];
  edges: CaveEdge[];
  factions: Faction[];
  events: SimulationEvent[];
}
```

`events` 应从 `string[]` 迁移到结构化事件。UI 可以显示 `message`，测试可以检查 `type`、`nodeIds`、`edgeIds`。

### 6.2 Suggested Modules

建议在 `src/sim` 下逐步形成这些模块：

- `types.ts`：共享数据契约。
- `world.ts`：只放查询、汇总、验证世界结构的纯函数。
- `graph.ts`：图查询和图变更，例如 open / block / collapse edge。
- `rng.ts`：seedable deterministic RNG。
- `tick.ts`：tick orchestration。
- `resources.ts`：资源流动规则。
- `stability.ts`：稳定性变化和坍塌判定。
- `events.ts`：事件创建和事件 helper。

不要一次性过度抽象。模块可以随 round 渐进建立，但最终不要把所有规则塞回 `world.ts`。

### 6.3 Graph Mutation API

建议命令式 API 仍保持纯函数：

```ts
export type GraphCommand =
  | { type: "open-edge"; edgeId: string }
  | { type: "block-edge"; edgeId: string }
  | { type: "collapse-edge"; edgeId: string; reason: string };

export function applyGraphCommand(
  world: WorldSnapshot,
  command: GraphCommand,
): WorldSnapshot;
```

最小规则：

- `open-edge`：只允许从 `blocked` 到 `open`。
- `block-edge`：只允许从 `open` 到 `blocked`。
- `collapse-edge`：可从 `open` 或 `blocked` 到 `collapsed`。
- `collapsed` 不应在 Phase 2 被直接 reopen，除非后续阶段定义修复系统。
- 所有有效变更都写入 `SimulationEvent`。
- 无效变更应返回原世界并写入 warning event，或抛出 typed error。二选一并保持一致。

### 6.4 Tick Pipeline

Phase 2 tick 顺序建议：

1. `tickStart`
2. resource flow
3. stability stress update
4. collapse checks
5. visibility/event bookkeeping
6. increment tick

此顺序先服务 Phase 2，未来可扩展到 NPC decisions、faction updates、combat resolution。

建议 API：

```ts
export interface TickOptions {
  resourceFlowRate: number;
  stabilityStressRate: number;
  collapseThreshold: number;
}

export function advanceTick(
  world: WorldSnapshot,
  options?: Partial<TickOptions>,
): WorldSnapshot;
```

默认 options 应集中定义，不要散落在测试和 UI 里。

### 6.5 Resource Flow Rules

MVP 资源流动规则应简单、可读、可测试：

- 只通过 `open` edge 流动。
- `blocked` 和 `collapsed` edge 不流动。
- 每 tick 每条开放边对每种资源做一次均衡流动。
- 高资源节点向低资源节点转移。
- 转移量受差值、`resourceFlowRate` 和 `traversalCost` 影响。
- 资源不得低于 0。
- 资源可先不设置上限，但测试中应避免生成负值或 NaN。

建议公式：

```text
delta = floor((fromAmount - toAmount) * resourceFlowRate / traversalCost)
```

当 `delta > 0` 时从高值节点流向低值节点。执行程序可以调整公式，但必须保持 deterministic 且测试覆盖。

### 6.6 Stability and Collapse Rules

Phase 2 稳定性规则应先服务可验证性：

- 每条 `open` edge 会对两端节点产生 stress。
- `stabilityStress` 越高，节点稳定性下降越快。
- 节点稳定性低于 `collapseThreshold` 后触发坍塌检查。
- 坍塌应优先影响连接该节点的某条开放边。
- 坍塌产生 `SimulationEvent`。
- 坍塌后 edge state 变为 `collapsed`，后续资源不再流动。

随机选择坍塌边时必须使用 deterministic RNG。

### 6.7 Debug UI Changes

Phase 2 UI 只需要暴露模拟状态，不需要完整交互。

最小 UI 改动：

- graph overview 从硬编码改为数据驱动邻接表。
- 显示 tick。
- 显示结构化事件日志。
- 显示每条边的 state、traversalCost、stabilityStress。
- 显示每个节点的 resources、stability、factionIds、npcIds。
- 可选：添加一个 `Advance Tick` 按钮，但必须通过 sim core API 推进，不得在 UI 内写规则。

如果添加按钮，`main.ts` 可以持有当前 `WorldSnapshot`，但状态变更必须调用 `advanceTick` 或 `applyGraphCommand`。

## 7. User or System Workflows

### 7.1 Developer Debug Workflow

1. `npm install`
2. `npm run verify`
3. `npm run dev`
4. 打开 `http://127.0.0.1:5173`
5. 观察 seed scenario 的节点、边、资源、稳定性和事件。
6. 如果加入 tick button，点击后确认资源和稳定性变化、事件追加。

### 7.2 Simulation Workflow

1. 读取 `seedScenario`。
2. 验证图结构合法性。
3. 执行图命令或 tick。
4. 生成新的 `WorldSnapshot`。
5. UI 重新渲染 snapshot。
6. 测试比较新旧 snapshot。

### 7.3 Test Workflow

测试应覆盖：

- 图查询。
- 图命令。
- resource flow。
- stability update。
- collapse event。
- deterministic replay。
- UI 关键数据是否来自 world，不来自硬编码文本。

## 8. Round Plan

Phase 2 预计 6 轮完成。每轮执行时使用 `$do-next-goal`，会话角色为 `执行程序`，并遵守每轮通过后 commit + push 的规则。

### Round 1：数据契约收口与 debug 图数据驱动

目标：

- 收口 `occupants` 语义。
- 将 debug graph 从硬编码改为数据驱动。
- 保持现有页面可运行。

可能影响文件：

- `src/sim/types.ts`
- `src/data/seedScenario.ts`
- `src/ui/debugView.ts`
- `src/tests/world.test.ts`

交付物：

- `CaveNode` 使用明确实体引用字段。
- graph overview 显示来自 `world.nodes` / `world.edges` 的邻接信息。
- 更新测试。

验收标准：

- `npm run verify` 通过。
- UI 中 edge 状态和 seed scenario 一致。
- 不再存在会误导 Phase 2 的硬编码 graph topology。

### Round 2：图验证与图命令

目标：

- 增加图结构验证。
- 增加 `applyGraphCommand`。
- 支持 open/block/collapse edge。

可能影响文件：

- `src/sim/graph.ts`
- `src/sim/events.ts`
- `src/sim/types.ts`
- `src/tests/graph.test.ts`

交付物：

- 图验证函数。
- 图命令纯函数。
- 命令事件。

验收标准：

- open edge 被视为 traversable。
- blocked/collapsed edge 不可通行。
- collapse 事件结构化记录。
- 无效命令行为一致且有测试。

### Round 3：Seedable RNG 与 tick shell

目标：

- 增加 deterministic RNG。
- 增加 `advanceTick` 外壳和 tick options。
- 同 seed 重跑一致。

可能影响文件：

- `src/sim/rng.ts`
- `src/sim/tick.ts`
- `src/sim/types.ts`
- `src/tests/tick.test.ts`

交付物：

- RNG state 存在于 `WorldSnapshot`。
- `advanceTick` 可推进 tick 并保持确定性。
- 基础 tick event。

验收标准：

- 相同 seed 和相同初始 world 推进 N tick 结果 deep equal。
- tick 顺序在代码中集中可读。
- 不使用 `Math.random()`。

### Round 4：资源流动

目标：

- 实现开放边上的资源均衡。
- 阻塞和坍塌边不流动。

可能影响文件：

- `src/sim/resources.ts`
- `src/sim/tick.ts`
- `src/tests/resources.test.ts`

交付物：

- 资源流动纯函数。
- tick pipeline 接入资源流动。
- 资源变化事件或 debug summary。

验收标准：

- 连接/切断边会改变资源分布。
- 资源不产生负值或 NaN。
- traversalCost 会影响流速。
- 测试覆盖 blocked/collapsed edge。

### Round 5：稳定性与坍塌

目标：

- 实现稳定性 stress update。
- 实现 deterministic collapse checks。

可能影响文件：

- `src/sim/stability.ts`
- `src/sim/tick.ts`
- `src/sim/events.ts`
- `src/tests/stability.test.ts`

交付物：

- 节点稳定性变化。
- 坍塌 edge state 更新。
- 坍塌事件。

验收标准：

- 低稳定性节点会触发坍塌检查。
- 坍塌后资源不再通过该边流动。
- 同 seed 下坍塌结果可复现。

### Round 6：Debug UI 集成与 Phase 2 验收

目标：

- 将 tick、资源、稳定性、事件可视化到 debug surface。
- 可选添加 `Advance Tick` 按钮。
- 完成 Phase 2 验收清单。

可能影响文件：

- `src/main.ts`
- `src/ui/debugView.ts`
- `src/styles.css`
- `src/tests/*.test.ts`
- `README.md`

交付物：

- Debug 页面展示真实模拟状态。
- README 更新 Phase 2 debug 使用说明。
- 完整测试和构建通过。

验收标准：

- `npm run verify` 通过。
- Browser 检查页面无 console error/warn。
- 推进 tick 后资源或稳定性变化可见。
- 事件日志解释主要变化。

## 9. Round Self-Check Standards

每轮结束前必须检查：

- 本轮目标是否完成。
- 变更是否只涉及本轮范围。
- `src/sim` 是否仍是世界事实来源。
- UI 是否只读 snapshot 或调用 sim core API。
- 新增类型是否命名清晰、语义稳定。
- 是否有对应测试。
- `npm run verify` 是否通过。
- 若有 UI 变化，是否用本地浏览器检查页面能加载。
- 是否更新 README 或文档中受影响的命令/说明。

通过后才允许 commit + push。

## 10. Debug Standards

调试必须证据驱动：

- 先复现问题。
- 读取最小相关测试、日志、diff 和状态。
- 修最小根因。
- 重新运行失败检查。
- 对持续性行为风险添加回归测试。

常见失败处理：

- Determinism 失败：检查 RNG state、事件排序、对象遍历顺序。
- Resource 失败：检查 open edge filter、traversalCost、负值保护。
- Collapse 失败：检查 threshold、候选 edge 集合、RNG 选择。
- UI 失败：检查 UI 是否仍引用硬编码 graph 文本。

## 11. Architecture Review Standards

每轮架构审查必须确认：

- Simulation core 与 UI 边界清晰。
- `WorldSnapshot` 是唯一世界状态载体。
- 事件结构化，可供 UI、测试和未来 history log 使用。
- 图命令和 tick 都是可测试纯函数。
- RNG 不依赖全局随机源。
- 模块依赖方向合理：`ui -> sim`，`data -> sim types`，`sim` 不依赖 `ui`。
- 没有为了当前 debug 页面牺牲未来可扩展性。

## 12. Code and Content Quality Constraints

硬约束：

- 不使用 `Math.random()` 参与模拟结果。
- 不在 UI 中实现模拟规则。
- 不继续使用含糊实体字段。
- 不把所有 Phase 2 规则塞进一个大文件。
- 不引入无必要依赖。
- 不做与 Phase 2 无关的重构。
- 新增公共类型必须有至少一个使用点和测试覆盖。
- 测试应验证行为，而不是只验证实现细节。

## 13. Verification Commands or Review Methods

每轮最低验证：

```sh
npm run verify
git status --short --branch
```

涉及 UI 的轮次额外验证：

```sh
npm run dev
```

然后用浏览器打开：

```text
http://127.0.0.1:5173
```

检查：

- 页面可加载。
- ROOTLINE header 可见。
- seed/tick/nodes/open edges/factions 可见。
- console 无 error/warn。
- 移动宽度无明显横向溢出。

## 14. Risks and Open Questions

### Risks

- 资源流动公式过早复杂化，导致测试难写。
- 事件继续使用字符串，后续 history 和 quest 系统难以扩展。
- UI debug 继续硬编码，掩盖 simulation core 错误。
- `WorldSnapshot` 被 UI 或测试直接 mutate，破坏 determinism。
- RNG state 设计不清晰，导致同 seed 不可复现。

### Open Questions

- 无效图命令应该抛 typed error，还是返回 warning event？
- `stability` 是否保持 0-100 范围？
- 资源是否需要上限？Phase 2 建议暂不引入。
- `collapsed` edge 是否永远不可恢复？Phase 2 建议不可恢复。
- Phase 2 是否添加 tick button？建议 Round 6 再决定。

## 15. Handoff Prompt for the Next AI

```text
Use $do-next-goal as 执行程序.

Goal:
Implement ROOTLINE Phase 2: cave graph and deterministic tick simulation core.

Source of truth:
docs/ROOTLINE_Phase_2_Architecture_Design_CN.md

Required reading:
- docs/ROOTLINE_Game_Design_Document.md
- docs/ROOTLINE_Technical_Design_Document.md
- docs/ROOTLINE_Project_Plan.md
- docs/ROOTLINE_Development_Roadmap_CN.md
- README.md
- src/sim/types.ts
- src/sim/world.ts
- src/data/seedScenario.ts
- src/ui/debugView.ts
- src/tests/world.test.ts

Planned rounds:
6 rounds.

Start with Round 1:
收口 CaveNode entity reference fields and make the debug graph data-driven.

Per-round gates:
- Run self-check, debug pass, and architecture review.
- Run npm run verify.
- Browser-check UI when the round affects presentation.
- Stage only relevant files.
- Commit and push the passed round before starting the next round.

Do not advance to the next round until the current round is pushed to the remote.
```

## 16. Local Document Verification

本计划已输出为本地文档：

`docs/ROOTLINE_Phase_2_Architecture_Design_CN.md`

验证要求：

- 文件存在。
- 包含 GoalNext 要求的 15 个核心章节。
- 可独立交给执行程序使用，不依赖聊天历史。
