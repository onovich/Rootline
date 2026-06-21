# ROOTLINE Phase 2 Round 4 资源流动架构设计

## 1. Objective

Round 4 的目标是在当前 deterministic tick shell 之上实现资源流动：每个 tick 中，资源只沿 `open` edge 在相邻洞穴节点之间流动，`blocked` 和 `collapsed` edge 不流动，且 `traversalCost` 会影响流速。

本轮成功标准：

> 打开、阻塞或坍塌一条边，会改变后续 tick 的资源分布，并且这个变化可测试、可复现、可在 debug UI 中观察。

## 2. Non-Goals

本轮不做以下内容：

- 不实现稳定性下降和坍塌判定，那是 Round 5。
- 不实现派系 AI、NPC 决策或迁徙。
- 不实现资源消耗、资源生产或资源上限。
- 不实现完整玩家操作界面。
- 不引入新的前端框架、状态管理库或数学库。
- 不把资源流动规则写进 UI。

## 3. Required Context

执行程序必须先阅读：

- `docs/ROOTLINE_Phase_2_Architecture_Design_CN.md`
- `docs/ROOTLINE_Project_Plan.md`
- `docs/ROOTLINE_Development_Roadmap_CN.md`
- `README.md`
- `src/sim/types.ts`
- `src/sim/tick.ts`
- `src/sim/graph.ts`
- `src/sim/events.ts`
- `src/data/seedScenario.ts`
- `src/tests/tick.test.ts`
- `src/tests/graph.test.ts`

当前已完成：

- Round 1：数据契约收口，`CaveNode` 已使用 `factionIds` / `npcIds`。
- Round 1：debug graph 已由 `world.nodes` / `world.edges` 数据驱动。
- Round 2：图验证与 `applyGraphCommand` 已存在。
- Round 3：`rngState`、seedable RNG、`advanceTick` shell 已存在。

## 4. Session Role and Routing Decision

当前会话角色：`架构师`。

本文件是 Round 4 的架构计划，不是实现提交。它用于交接给 `执行程序` 使用 `$do-next-goal` 完成资源流动实现。

本地文档路径：

`docs/ROOTLINE_Phase_2_Round_4_Resource_Flow_Architecture_CN.md`

## 5. Design or Architecture Constraints

### 5.1 Simulation Core Owns the Rule

资源流动必须在 `src/sim` 中实现。`src/ui` 只能显示结果，不得计算资源变化。

禁止：

- 在 `debugView.ts` 中计算资源 delta。
- 在 `main.ts` 中直接修改节点资源。
- 为了 UI 展示复制一套资源流动逻辑。

### 5.2 Deterministic and Pure

资源流动必须是 deterministic pure transformation。

要求：

- 输入相同 `WorldSnapshot` 和 `TickOptions`，输出必须 deep equal。
- 不使用 `Math.random()`。
- 不读取时间、DOM、localStorage 或网络。
- 不 mutate 输入 world、node、edge 或 resource object。

### 5.3 Snapshot-Based Flow

同一 tick 内的资源流动应基于 tick 开始时的资源快照计算，避免边遍历顺序影响结果。

要求：

- 先读取所有节点的原始资源。
- 计算所有 open edge 上的资源 delta。
- 聚合 delta 后一次性应用到新节点资源。

不要让第一条 edge 的转移结果影响同 tick 后续 edge 的转移计算。

### 5.4 Open Edges Only

只有 `edge.state === "open"` 的边参与资源流动。

要求：

- `blocked` edge 不流动。
- `collapsed` edge 不流动。
- 测试必须覆盖三种 edge state。

### 5.5 Traversal Cost Matters

`traversalCost` 必须影响流速。

要求：

- 同样资源差值下，cost 较高的 edge 转移量更少。
- `traversalCost <= 0` 已由图验证视为错误；资源流动函数仍应避免除以 0。

## 6. Data, Content, and Module Design

### 6.1 New Module

新增文件：

`src/sim/resources.ts`

该文件负责资源流动规则，建议导出：

```ts
export interface ResourceFlowDelta {
  edgeId: string;
  resource: ResourceKey;
  fromNodeId: string;
  toNodeId: string;
  amount: number;
}

export interface ResourceFlowResult {
  world: WorldSnapshot;
  deltas: ResourceFlowDelta[];
}

export function flowResources(
  world: WorldSnapshot,
  options?: Pick<TickOptions, "resourceFlowRate">,
): ResourceFlowResult;
```

执行程序也可以命名为 `applyResourceFlow`，但必须保持职责清楚：纯函数输入 world，输出新 world 和 delta summary。

### 6.2 Flow Formula

建议公式：

```text
difference = highAmount - lowAmount
rawDelta = difference * resourceFlowRate / traversalCost
amount = floor(rawDelta)
```

当 `amount > 0`：

- 从资源较高节点扣除 `amount`。
- 给资源较低节点增加 `amount`。
- 记录 `ResourceFlowDelta`。

当 `amount <= 0`：

- 不转移。
- 不记录 delta。

### 6.3 Direction Rule

每种资源独立计算。

对于每条 open edge：

1. 读取 `from` 与 `to` 两端节点。
2. 对 `food`、`oxygen`、`heat` 分别比较数量。
3. 高值节点流向低值节点。
4. 相等时不流动。

注意：edge 的 `from` / `to` 不是资源流向，只是图结构端点。资源流向由当前资源量决定。

### 6.4 Numeric Guardrails

资源结果必须满足：

- 所有资源值为有限数值。
- 所有资源值 `>= 0`。
- 不产生 `NaN`。
- 不产生 `Infinity`。
- 每个资源的全世界总量在本轮保持守恒。

如果计算出的扣除量大于高值节点当前资源，应 clamp 到高值节点资源量。

### 6.5 Tick Integration

修改 `src/sim/tick.ts`。

建议 `advanceTick` 流程：

1. resolve tick options。
2. 创建 `tickingWorld`：`tick + 1`，`rngState` 推进一次。
3. 调用 `flowResources(tickingWorld, { resourceFlowRate })`。
4. 如果存在 resource deltas，追加一个 `resource` event。
5. 追加或保留 `tick` event。

事件顺序建议：

```text
resource event -> tick event
```

理由：

- tick event 可以作为本 tick 收尾摘要。
- 后续 Round 5 接入 stability / collapse 时，可保持 pipeline 可读：
  `resource -> stability -> collapse -> tick summary`。

现有 `tick.test.ts` 允许更新，因为 Round 4 改变了 tick event 位置和事件总数。

### 6.6 Resource Event Strategy

不要每个资源 delta 都写一个事件，避免事件日志噪音。

建议每 tick 最多追加一个 resource event：

```ts
appendSimulationEvent(world, {
  type: "resource",
  message: `Resources flowed across ${edgeCount} open edges with ${deltaCount} transfers.`,
  edgeIds,
  nodeIds,
});
```

要求：

- `edgeIds` 包含发生资源转移的 edge。
- `nodeIds` 包含发生资源变化的 node。
- 如果没有任何 delta，不追加 resource event。

### 6.7 Debug UI Expectations

Round 4 不强制新增按钮，但 debug UI 必须能显示资源变化后的 world。

如果执行程序添加 `Advance Tick` 按钮：

- `main.ts` 可以持有当前 `WorldSnapshot`。
- 按钮点击必须调用 `advanceTick`。
- UI 重新渲染 `renderRootlineDebug(app, currentWorld)`。
- 不得在 UI 中写资源公式。

如果不添加按钮：

- 至少测试 `advanceTick` 后的 world 资源变化。
- README 可说明当前资源流动通过测试验证，UI 交互将在 Round 6 集成。

## 7. User or System Workflows

### 7.1 Simulation Workflow

1. 从 `seedScenario` 读取 world。
2. 调用 `advanceTick(world)`。
3. tick 内部调用 `flowResources`。
4. 只沿 open edge 计算资源 delta。
5. 返回新 `WorldSnapshot`。
6. 事件日志记录 resource summary。

### 7.2 Graph Command Interaction Workflow

资源流动必须能反映图命令结果：

1. 使用 `applyGraphCommand` 打开 `spore-sealed`。
2. 再调用 `advanceTick`。
3. `sealed-vein` 应能与 `spore-market` 交换资源。

反向也必须成立：

1. 使用 `applyGraphCommand` collapse `rootwell-spore`。
2. 再调用 `advanceTick`。
3. `rootwell` 与 `spore-market` 不再通过该 edge 流动。

### 7.3 Test Workflow

新增测试文件：

`src/tests/resources.test.ts`

测试应覆盖：

- open edge 会流动。
- blocked edge 不流动。
- collapsed edge 不流动。
- traversalCost 改变流量。
- 资源总量守恒。
- 输入 world 不被 mutate。
- 同一输入重复运行 deep equal。
- `advanceTick` 接入资源流动。

## 8. Round Plan

本目标建议 1 轮完成。如果执行程序需要拆分，可拆成 2 个子轮，但每个子轮仍必须通过 `$do-next-goal` 的 commit + push 门槛。

### Round 4A：资源流动纯函数

目标：

- 新增 `src/sim/resources.ts`。
- 实现 snapshot-based resource flow。
- 添加 `src/tests/resources.test.ts`。

可能影响文件：

- `src/sim/resources.ts`
- `src/sim/types.ts`
- `src/tests/resources.test.ts`

交付物：

- `flowResources` 或等价纯函数。
- `ResourceFlowDelta` / `ResourceFlowResult` 或等价 summary。
- 资源流动测试。

验收标准：

- open edge 产生资源变化。
- blocked/collapsed edge 不流动。
- traversalCost 会影响 delta。
- 总资源守恒。
- 输入 world 不 mutate。
- `npm run verify` 通过。

### Round 4B：tick pipeline 接入

目标：

- 将资源流动接入 `advanceTick`。
- 追加结构化 resource event。
- 更新 tick tests 和 README。

可能影响文件：

- `src/sim/tick.ts`
- `src/sim/events.ts`
- `src/tests/tick.test.ts`
- `README.md`

交付物：

- tick 推进时资源变化。
- resource event summary。
- deterministic replay 测试继续通过。

验收标准：

- `advanceTick(seedScenario)` 会改变至少一个 open-edge 相邻节点资源。
- 同 seed replay deep equal。
- event log 包含 resource event。
- `npm run verify` 通过。

## 9. Round Self-Check Standards

Round 4 完成前必须检查：

- 是否新增 `src/sim/resources.ts`，且 UI 没有资源公式。
- 是否只沿 open edge 流动。
- 是否使用 tick 开始资源快照计算所有 delta。
- 是否没有 `Math.random()`。
- 是否没有输入 mutation。
- 是否资源总量守恒。
- 是否 `traversalCost` 影响流速。
- 是否 blocked/collapsed edge 有测试。
- 是否 `advanceTick` 仍 deterministic。
- 是否 `npm run verify` 通过。
- 是否只提交与 Round 4 相关文件。

通过后才允许 commit + push。

## 10. Debug Standards

如果测试失败：

- 资源不守恒：检查 delta 聚合是否重复扣除或重复加成。
- blocked/collapsed edge 流动：检查 edge filter 是否只允许 `open`。
- traversalCost 无影响：构造两个相同差值、不同 cost 的 edge 对照测试。
- 输入被 mutate：检查是否直接修改 `node.resources`。
- replay 不一致：检查是否依赖对象遍历不稳定顺序或外部状态。
- event id 不符合预期：检查 append 顺序和当前 `world.tick`。

修复后必须重新运行：

```sh
npm run verify
```

## 11. Architecture Review Standards

架构审查必须确认：

- `src/sim/resources.ts` 不依赖 `src/ui`。
- `src/sim/tick.ts` 只编排 pipeline，不塞入复杂资源公式。
- `src/sim/resources.ts` 对外 API 小而明确。
- `WorldSnapshot` 仍是唯一世界状态载体。
- `ResourceFlowDelta` 只描述本 tick 变化，不成为新的长期状态。
- event summary 结构化，可供 UI 和未来 history 使用。
- 资源流动规则足够简单，后续可扩展生产/消耗/派系需求。

## 12. Code and Content Quality Constraints

硬约束：

- 不在 UI 中实现资源流动。
- 不 mutate 输入 world。
- 不引入外部依赖。
- 不做资源上限、消耗、生产等非本轮目标。
- 不把资源流动和稳定性坍塌混在同一模块。
- 不用 snapshot 之外的临时全局状态。
- 不让测试只检查事件文本；必须检查实际资源数值。

## 13. Verification Commands or Review Methods

最低验证：

```sh
npm run verify
git status --short --branch
```

如果添加或修改 debug UI：

```sh
npm run dev
```

然后浏览器检查：

- 页面加载成功。
- console 无 error/warn。
- 资源值显示正常。
- tick 后资源变化可见，如果本轮添加了按钮。
- 移动宽度无明显横向溢出。

## 14. Risks and Open Questions

### Risks

- 直接边遍历即时修改资源，导致结果受 edge 顺序影响。
- 每个 delta 都写事件，导致日志噪音过大。
- 资源公式过复杂，后续平衡困难。
- 当前 seed 差值不够明显，测试难以看出 traversalCost 影响。
- tick event 顺序变化导致旧测试需要合理更新。

### Open Questions

- `resourceFlowRate` 是否允许为 0 或大于 1？
  - 建议 Round 4 允许 0，不建议大于 1；如传入大于 1，可 clamp 到 1 或由测试规定行为。

- 是否要记录每个 resource delta 到 event message？
  - 建议不要。保留 `ResourceFlowDelta` 给测试和调试，event 只写摘要。

- 是否要显示 resource deltas 到 UI？
  - 本轮不强制。Round 6 再做更好的 debug UI 集成。

## 15. Handoff Prompt for the Next AI

```text
Use $do-next-goal as 执行程序.

Goal:
Implement ROOTLINE Phase 2 Round 4 resource flow.

Source of truth:
docs/ROOTLINE_Phase_2_Round_4_Resource_Flow_Architecture_CN.md

Required reading:
- docs/ROOTLINE_Phase_2_Architecture_Design_CN.md
- README.md
- src/sim/types.ts
- src/sim/tick.ts
- src/sim/graph.ts
- src/sim/events.ts
- src/data/seedScenario.ts
- src/tests/tick.test.ts
- src/tests/graph.test.ts

Planned round:
One round, split into Round 4A and 4B only if needed.

Implementation target:
- Add src/sim/resources.ts.
- Implement snapshot-based resource flow across open edges.
- Integrate resource flow into advanceTick.
- Add resource flow tests.
- Preserve deterministic replay.

Per-round gates:
- Run npm run verify.
- Confirm no resource formula exists in UI code.
- Confirm blocked and collapsed edges do not flow.
- Confirm traversalCost affects flow amount.
- Commit and push the passed round before advancing.

Do not implement stability/collapse logic in this round.
```

## 16. Local Document Verification

本计划已输出为本地文档：

`docs/ROOTLINE_Phase_2_Round_4_Resource_Flow_Architecture_CN.md`

验证要求：

- 文件存在。
- 包含 GoalNext 要求的核心章节。
- 可独立交给执行程序使用，不依赖聊天历史。
