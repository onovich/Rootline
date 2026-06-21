# ROOTLINE 玩家角色场景映射与 QA

## 1. Objective

本轮目标是对 `docs/ROOTLINE_Player_Role_System_Design_CN.md` 中的四个首批玩家角色做 Round 2 执行策划 QA：把角色放入首批高密度场景框架中，检查每个角色是否至少在两个场景中产生明显不同解法，并确认每个角色行动都能追踪到触发条件、状态变化、玩家反馈和副作用。

一句话目标：

> 验证四个角色不是“换一段背景开场白”，而是在同一条地下危机中制造不同判断、不同代价和不同历史。

## 2. Non-Goals

本轮不做以下内容：

- 不完整设计 `The Sealed Choir`、`The Hungry Vein`、`The Cracking Crown` 三个场景。
- 不新增正式剧情脚本、对话树或 NPC 台词。
- 不决定最终 `PlayerRole`、`Quest`、`Relation` 或 `ActionCommand` 程序数据契约。
- 不要求当前程序 Phase 2 立即实现角色选择或场景系统。
- 不扩写派系圣经、事件库或区域生态库。
- 不改动源代码。

本轮只输出执行策划 QA 和场景映射，供主策划复审和架构师后续拆分。

## 3. Required Context

本文件对齐以下资料：

- `docs/ROOTLINE_Lead_Design_Principles_CN.md`
- `docs/ROOTLINE_Player_Role_System_Design_CN.md`
- `docs/ROOTLINE_Design_Work_Roadmap_CN.md`
- `docs/ROOTLINE_Lead_Designer_Handoff_CN.md`
- `docs/ROOTLINE_Project_Plan.md`
- `docs/ROOTLINE_Phase_2_Architecture_Design_CN.md`
- `README.md`
- `src/data/seedScenario.ts`

当前角色来源：

- `role.rootline_surveyor`：根脉测绘员。
- `role.strata_engineer`：地层工程师。
- `role.exiled_mediator`：放逐调停者。
- `role.breach_prospector`：破壁开拓者。

当前候选场景来自策划路线图 Phase 8：

- `scenario.sealed_choir`：信仰传播与隔离。
- `scenario.hungry_vein`：资源流动与生存危机。
- `scenario.cracking_crown`：稳定性、派系利益、灾害管理。

## 4. Session Role and Routing Decision

当前会话角色：`执行策划`。

执行策划职责：

- 检查角色内容是否可系统化。
- 把角色行动映射到场景问题和状态变化。
- 给出可执行 QA 结论和修正建议。
- 将需要程序支持的新能力留给架构师审查。

本文件不替代主策划方向，不直接授权执行程序实现。

## 5. Round 2 Acceptance Criteria

本轮通过条件：

- 每个角色至少在 2 个候选场景中拥有明显不同解法路径。
- 每个角色至少有 2 条可区分路线：主路线和替代路线。
- 每条路线都包含触发条件、状态变化、玩家反馈和代价。
- 每个角色行动都能追踪到可见反馈或状态变化。
- 没有 lore-only 角色条目。
- 新增实现需求以架构审查项表达，不直接要求程序实现。

## 6. Scenario Frames Used for QA

以下只是 QA 用场景框架，不是完整场景设计。

| scenarioId | 核心问题 | 关键拓扑对象 | 主要状态轴 | 参与派系 | QA 用途 |
| --- | --- | --- | --- | --- | --- |
| `scenario.sealed_choir` | 是否打开一条被信仰禁忌封存的回声通路 | blocked edge, isolation, taboo boundary | 派系关系、信仰传播、可达性 | Echo Cult, Excavator Union, Strata Guild | 检查角色如何处理禁忌与连接 |
| `scenario.hungry_vein` | 封闭区域因氧气和食物不足进入危机 | blocked edge, resource path, reachable component | 资源、迁徙、时间窗口 | Excavator Union, Strata Guild | 检查角色如何处理资源流与风险 |
| `scenario.cracking_crown` | 核心节点群稳定性下降，任何通路变化都会转移压力 | open edge, collapsed risk, chokepoint | 稳定性、坍塌、派系追责 | Strata Guild, Echo Cult, Excavator Union | 检查角色如何处理灾害政治 |

## 7. Role Scenario Mapping

### 7.1 根脉测绘员

设计判断：测绘员的差异成立，前提是“信息优势”必须改变后续选择，而不是只多显示地图。

| 场景 | 主路线 | 替代路线 | 触发条件 | 状态变化 | 玩家反馈 | 代价 |
| --- | --- | --- | --- | --- | --- | --- |
| `scenario.sealed_choir` | 使用 `action.deep_survey` 找出回声墙外的低冲击连接点，再建议延迟打开禁忌边 | 使用 `action.trace_unstable_edge` 标记高风险禁忌边，转而维持隔离 | 已知 blocked edge，Echo Cult 对破壁敏感 | visibility 或 edge knowledge 增加；eventLog append survey/warning | “旧图显示真正薄弱处不在圣墙，而在侧脉。” | 推进 tick，可能让资源危机恶化 |
| `scenario.hungry_vein` | 先确认 `spore-sealed` 是否是唯一资源路径，再决定开路 | 找到替代连通路线，避免直接破坏高压边 | Sealed Vein 资源低，至少一条未知或 blocked edge | knownEdgeIds 增加；资源风险事件获得原因说明 | “饥荒不是因为食物不存在，而是因为路径被封死。” | 信息行动不直接救急 |
| `scenario.cracking_crown` | 追踪压力来源，定位哪条 open edge 正把应力传给核心节点 | 标记不应开掘的未知边，建议等待工程师或封闭高压边 | 核心节点 stability 下降 | warning event，edge stress 可见 | “裂缝沿开放边传播，不是单点坍塌。” | 无法自行降低坍塌概率 |

QA 结论：

- 通过。测绘员在三个场景中都能通过初始信息和调查行动改变判断。
- 风险：如果程序只实现“显示更多地图”，测绘员会变弱。架构审查时必须要求 survey action 能生成解释性事件或 risk marker。

### 7.2 地层工程师

设计判断：工程师的差异成立，前提是加固不是无成本修复按钮，而是时间、资源、关系或压力转移之间的选择。

| 场景 | 主路线 | 替代路线 | 触发条件 | 状态变化 | 玩家反馈 | 代价 |
| --- | --- | --- | --- | --- | --- | --- |
| `scenario.sealed_choir` | 对禁忌边做 `action.stress_test`，证明直接开路会伤及回声结构 | 使用 `action.emergency_shoring` 临时支撑低风险侧脉，换取见证开路窗口 | blocked edge 争议，stabilityStress 高 | warning event；临时 edge/node modifier 待审 | “问题不是能不能开，而是谁承担应力。” | Echo Cult 仍可能要求仪式见证；Union 不满拖延 |
| `scenario.hungry_vein` | 支护 `spore-sealed` 后打开，让资源流入 Sealed Vein | 判定开路过危，建议短期封闭并组织迁徙 | low resource node + blocked edge + stress risk | edge state 可变化；node stability 或 collapse risk 变化待审 | “支护撑住了三次呼吸的时间，不是永久安全。” | 消耗资源或延迟救援 |
| `scenario.cracking_crown` | 封闭或支护高压 open edge，优先保住核心节点 | 打开分流通路降低某条边压力，但把风险扩散到次级节点 | 核心节点 stability 低于阈值 | stability warning；possible edge blocked/open | “压力被转移，而不是消失。” | 被 Excavator Union 指责阻断资源 |

QA 结论：

- 通过。工程师在资源危机和坍塌危机中有明确非战斗解法。
- 风险：`emergency_shoring` 需要 edge/node modifier 或事件延迟机制，必须进入架构优先审查。

### 7.3 放逐调停者

设计判断：调停者的差异成立，前提是调停改变派系对拓扑行动的解释，而不是跳过拓扑代价。

| 场景 | 主路线 | 替代路线 | 触发条件 | 状态变化 | 玩家反馈 | 代价 |
| --- | --- | --- | --- | --- | --- | --- |
| `scenario.sealed_choir` | 使用 `action.translate_taboo` 把 Echo Cult 的禁忌转成可协商条件 | 使用 `action.threshold_parley` 让 Union 接受延迟开路，等待见证窗口 | 两个派系围绕同一 blocked edge 产生冲突 | relation penalty 降低或冲突冷却待审；eventLog append faction explanation | “他们反对的不是道路，而是未经承认的伤口。” | 调停失败会留下偏袒记录 |
| `scenario.hungry_vein` | 让资源受困方接受短期配给，换取工程检查时间 | 说服 Echo/Strata 允许临时人道通道，但保留后续封闭权 | resource crisis + relation 未敌对 | crisis timer 延后或 faction hostility 缓冲待审 | “Sealed Vein 同意把‘开路’改称为‘借气’。” | 需要承诺补偿或牺牲另一方好感 |
| `scenario.cracking_crown` | 调停封路造成的资源分配争议 | 让派系共同承认一次高风险支护失败不是单方背叛 | 核心节点稳定性下降并触发封路争议 | relation loss 被解释并缓冲；history log 记录见证 | “封闭不是惩罚，而是防止王冠裂成两半。” | 不能直接改变 stability |

QA 结论：

- 通过。调停者至少在两个场景中提供独立路线，而且代价集中在关系和承诺。
- 风险：当前程序无 relation model，调停行动短期只能作为事件解释和未来系统需求。

### 7.4 破壁开拓者

设计判断：开拓者的差异成立，前提是快速开路带来即时收益和明确后患，不能成为默认最优。

| 场景 | 主路线 | 替代路线 | 触发条件 | 状态变化 | 玩家反馈 | 代价 |
| --- | --- | --- | --- | --- | --- | --- |
| `scenario.sealed_choir` | 使用 `action.force_breach` 直接打开禁忌 blocked edge | 使用 `action.risky_shortcut` 绕过圣墙，打开不稳定侧路 | known blocked edge，Union 支持扩张 | edge blocked -> open；stress 或 taboo event 追加待审 | “墙开了，回声断了，空气开始流动。” | Echo Cult 敌意、Strata 追责、collapse risk 上升 |
| `scenario.hungry_vein` | 在危机 tick 前强开 `spore-sealed`，立刻恢复资源流 | 选择短路接入另一节点，牺牲稳定性换取迁徙窗口 | Sealed Vein oxygen/food 低于阈值 | edge state open；resource flow 恢复；warning event | “饥饿被推迟，裂缝提前到来。” | 未来坍塌概率和关系惩罚上升 |
| `scenario.cracking_crown` | 打开分流新路，试图降低核心通道压力 | 破坏一条危险边形成隔离带，牺牲可达性防止连锁坍塌 | core node stability 低；有 blocked 或 open high stress edge | edge open 或 collapsed/blocked；reachable components 改变 | “你不是修好王冠，而是把它掰成还能站住的几块。” | 可能永久失去资源路径 |

QA 结论：

- 通过。开拓者在至少两个场景中具备高风险快速路线。
- 风险：需要明确 force breach 的概率、稳定性和关系副作用，否则容易压过其他角色路线。

## 8. Action Traceability QA

| actionId | roleId | 可用场景 | 触发条件是否清晰 | 状态变化是否清晰 | 玩家反馈是否清晰 | QA 结论 |
| --- | --- | --- | --- | --- | --- | --- |
| `action.deep_survey` | `role.rootline_surveyor` | Sealed Choir, Hungry Vein | 通过：visited node + unknown/blocked/high stress adjacency | 通过：edge knowledge / visibility / survey event | 通过：解释隐藏通路或风险来源 | 可进入架构审查 |
| `action.trace_unstable_edge` | `role.rootline_surveyor` | Hungry Vein, Cracking Crown | 通过：known edge + low stability node | 通过：warning event / risk marker | 通过：解释坍塌风险来自哪条边 | 可进入架构审查 |
| `action.stress_test` | `role.strata_engineer` | Sealed Choir, Cracking Crown | 通过：known edge open/blocked | 通过：显示 stress 或生成 warning | 通过：解释压力传导 | 可先作为 inspect modifier 设计 |
| `action.emergency_shoring` | `role.strata_engineer` | Hungry Vein, Cracking Crown | 通过：low stability 或 high stress | 部分通过：需要 modifier/延迟机制 | 通过：说明临时支护非永久解决 | 架构优先审查 |
| `action.threshold_parley` | `role.exiled_mediator` | Sealed Choir, Hungry Vein | 通过：至少两个派系受同一边影响 | 部分通过：需要 relation/cooldown model | 通过：说明见证、延迟、承诺 | 等 relation 系统 |
| `action.translate_taboo` | `role.exiled_mediator` | Sealed Choir, Cracking Crown | 通过：行动触及派系禁忌 | 通过：event explanation；关系变化待审 | 通过：解释禁忌和替代代价 | 可先做事件解释 |
| `action.force_breach` | `role.breach_prospector` | Sealed Choir, Hungry Vein | 通过：known blocked edge | 通过：blocked -> open + stress/taboo | 通过：快速收益和后患 | 架构优先审查 |
| `action.risky_shortcut` | `role.breach_prospector` | Hungry Vein, Cracking Crown | 通过：不可达目标 + known blocked edge | 部分通过：需要路径/组件判断 | 通过：解释非安全路线 | 等 graph reachability 支持 |

## 9. Personal Goal Scenario Fit

| goalId | 适配场景 | 可判定状态 | QA 结论 |
| --- | --- | --- | --- |
| `goal.map_three_route_decisions` | 三个场景均可 | 至少 3 次 edge/node/faction decision 生成原因事件 | 通过 |
| `goal.finish_with_explained_history` | 三个场景均可 | 结局摘要引用 2 条因果链 | 通过，但依赖 history summary 系统 |
| `goal.prevent_critical_collapse` | Hungry Vein, Cracking Crown | 核心节点或关键边未发生 critical collapse | 通过 |
| `goal.stabilize_two_stressed_routes` | Cracking Crown | 两条 high stress route 被支护、封闭或分流 | 通过，但依赖 stress 标签 |
| `goal.prevent_two_faction_break` | Sealed Choir, Hungry Vein | 关系未跌入敌意阈值 | 通过，但依赖 relation model |
| `goal.reconcile_taboo_after_topology_change` | Sealed Choir | 禁忌事件后有补偿或解释事件 | 通过 |
| `goal.open_sealed_route` | Sealed Choir, Hungry Vein | 至少一条 blocked edge 变为 open 并触发后果 | 通过 |
| `goal.survive_consequence_chain` | Hungry Vein, Cracking Crown | 高风险开路后处理至少一个副作用事件 | 通过 |

## 10. Role Difference Coverage Audit

| roleId | 出生点 | 初始信息 | 可用行动 | 派系关系 | 个人目标 | 结论 |
| --- | --- | --- | --- | --- | --- | --- |
| `role.rootline_surveyor` | `rootwell` | 周边节点、旧图、封闭边 | survey / risk trace | 中立偏 Strata | 记录决策和历史解释 | 5/5 通过 |
| `role.strata_engineer` | `rootwell` | 应力和稳定性 | stress test / shoring | 强 Strata、弱 Union | 防坍塌和支护 | 5/5 通过 |
| `role.exiled_mediator` | `spore-market` | 派系禁忌和争议利益 | parley / taboo translation | Echo 与 Union 友好，Strata 怀疑 | 防止关系破裂 | 5/5 通过 |
| `role.breach_prospector` | `sealed-vein` | 封闭边和扩张机会 | force breach / shortcut | 强 Union、弱 Echo 和 Strata | 打开路线并处理后患 | 5/5 通过 |

## 11. Content Debug Findings

### 11.1 已通过项

- 四个角色都不依赖完整成长树即可形成差异。
- 四个角色都能在至少两个场景中产生不同路线。
- 八个角色行动都能指向拓扑、可见性、稳定性、关系、资源或历史中的至少一项。
- 高风险路线和保守路线都有明确代价。

### 11.2 需后续修正或审查项

| 问题 | 当前影响 | 最小修复 |
| --- | --- | --- |
| 角色行动缺少统一字段模板 | 执行程序难以判断 action 是 command、modifier 还是 event hook | Round 3 将行动拆成纯信息、图命令、关系缓冲、目标判定四类 |
| 调停者依赖 relation model | 当前程序 Phase 2 无法表现关系缓冲 | 先作为事件解释内容保留，等待 Phase 4 派系系统 |
| 工程师支护需要临时状态 | 当前 CaveEdge / CaveNode 无 modifier | 提交架构审查，判断是否用 event delay、edge modifier 或 scenario flag |
| 开拓者可能成为默认最优 | 强开 blocked edge 若没有副作用会压过其他路线 | 强制绑定 stress、taboo、relation 或 future collapse risk |
| ID 风格未统一 | 策划 dot ID 与代码 hyphen ID 并存 | Round 3 输出 ID 映射和架构审查问题 |

## 12. Architect Review Priority

按玩家价值和实现依赖排序：

1. `design.req.role.starting_knowledge`
   - 价值：最小成本制造开局差异。
   - 依赖：visibility / scenario initialization。
   - 建议优先级：high。

2. `design.req.role.special_actions`
   - 价值：让角色玩法差异从行动体现。
   - 依赖：command system、graph command、event log。
   - 建议优先级：high。

3. `design.req.role.initial_faction_relations`
   - 价值：让同一拓扑行动被派系不同解释。
   - 依赖：relation model。
   - 建议优先级：high，但可等派系系统。

4. `design.req.role.personal_goals`
   - 价值：让结局历史按角色变化。
   - 依赖：quest/objective/history summary。
   - 建议优先级：medium。

## 13. Round 2 Self-Check

### 13.1 目标检查

- 已新增角色场景 QA 文档。
- 未进入完整场景设计。
- 未扩写派系圣经或事件库。

### 13.2 系统化检查

- 每个角色路线包含触发条件、状态变化、玩家反馈和代价。
- 八个行动均有 traceability QA。
- 个人目标均映射到可判定状态。

### 13.3 玩家感知检查

- 测绘员看见风险来源。
- 工程师看见压力转移。
- 调停者看见派系解释和承诺代价。
- 开拓者看见快速收益和后患。

### 13.4 拓扑核心检查

- 所有场景都围绕 edge state、可达性、隔离、资源路径、稳定性或坍塌风险。
- 所有角色至少在两个场景中改变连接判断或连接代价。

### 13.5 协议检查

- 未提出未经审查的最终程序契约。
- 新实现需求保留在架构审查项中。
- 未要求 Phase 2 承担完整外交、任务或历史系统。

## 14. Next Round Recommendation

Round 3 应进行“架构审查准备与实现分层”：

- 将角色字段拆成 content-only、scenario initialization、command/action、relation、quest/history 五类。
- 为八个角色行动补统一 `RoleAction` 字段草案。
- 输出 ID 映射策略：策划 dot ID 与当前代码 hyphen ID 如何对齐。
- 准备给架构师的优先审查清单。

## 15. Handoff Prompt

```text
Use goal-driven execution for ROOTLINE.

Session role:
执行策划

Goal:
Continue Goal 2 player role system work from Round 3.

Required reading:
- docs/ROOTLINE_Player_Role_System_Design_CN.md
- docs/ROOTLINE_Role_Scenario_QA_CN.md
- docs/ROOTLINE_Lead_Design_Principles_CN.md
- docs/ROOTLINE_Design_Work_Roadmap_CN.md
- docs/ROOTLINE_Phase_2_Architecture_Design_CN.md

First target:
Prepare architecture review and implementation layering for player roles.

Execution rules:
1. Do not implement code.
2. Split each field/action into content-only, scenario initialization, graph command, relation model, or quest/history dependency.
3. Convert every system dependency into an architect-review item with player value and acceptance criteria.
4. Commit and push after the round gate passes.
```
