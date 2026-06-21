# ROOTLINE 玩家角色系统执行策划文档

## 1. Objective

本目标将主策划 Goal 1 的原则转化为可执行的玩家角色系统首版内容。角色系统必须证明：不同角色不是数值皮肤，而是在开局信息、出生位置、可用行动、派系关系、个人目标和风险解释上制造不同玩法。

一句话目标：

> 让同一条地下通路，在不同角色手里变成测绘问题、工程问题、外交问题或高风险开拓问题。

本文件是执行策划产出，供主策划复审、架构师审查字段和执行程序后续实现。它不直接授权程序新增数据契约。

## 2. Non-Goals

本阶段不做以下内容：

- 不设计完整角色成长树。
- 不设计装备系统、技能树或等级曲线。
- 不设计完整对话树。
- 不改变玩家身份仍是测绘者、调停者、工程干预者或危险开拓者的总方向。
- 不要求当前 Phase 2 程序立即实现角色选择 UI。
- 不要求程序侧在未审查前加入新的 `PlayerRole` 核心模型。
- 不把角色差异写成单纯属性加成。
- 不扩写大量角色剧情，只保留可系统触发的个人目标和开局钩子。

## 3. Required Context

本文件对齐以下资料：

- `docs/ROOTLINE_Game_Design_Document.md`
- `docs/ROOTLINE_Technical_Design_Document.md`
- `docs/ROOTLINE_Project_Plan.md`
- `docs/ROOTLINE_Development_Roadmap_CN.md`
- `docs/ROOTLINE_Design_Work_Roadmap_CN.md`
- `docs/ROOTLINE_Lead_Designer_Handoff_CN.md`
- `docs/ROOTLINE_Lead_Design_Principles_CN.md`
- `docs/ROOTLINE_Phase_2_Architecture_Design_CN.md`
- `README.md`
- `src/sim/types.ts`
- `src/data/seedScenario.ts`

当前技术事实：

- 程序侧处于 Phase 2：洞穴图与 deterministic tick simulation core。
- 当前 seed scenario 已有节点 `rootwell`、`echo-vault`、`spore-market`、`sealed-vein`。
- 当前 seed scenario 已有派系 `echo-cult`、`excavator-union`、`strata-guild`。
- 当前核心类型尚无 `PlayerRole`、角色行动、角色目标或派系关系模型。

## 4. Session Role and Routing Decision

当前会话角色：`执行策划`。

执行策划职责：

- 把主策划方向转成内容表、字段、示例条目、触发条件、数值范围、玩家反馈、系统效果和 QA 清单。
- 不擅自改变核心体验方向。
- 不直接定义最终代码模块边界。
- 对需要程序支持的新能力，以候选需求工单形式提交给架构师审查。

本地文档路径：

`docs/ROOTLINE_Player_Role_System_Design_CN.md`

## 5. Design Constraints

### 5.1 角色差异必须至少覆盖 3 个维度

每个首批角色必须至少在以下 5 个维度中覆盖 3 个：

- 不同出生点。
- 不同初始信息。
- 不同可用行动。
- 不同派系关系。
- 不同个人目标或结局评价。

### 5.2 角色行动必须服务拓扑核心

每个角色至少拥有 1 个与连接、切断、封闭、坍塌、开路、可达性、隔离、稳定性或风险解释相关的行动或被动差异。

### 5.3 角色内容必须可系统化

每个角色条目必须尽量包含：

- 稳定 ID。
- 开局状态。
- 初始已知信息。
- 触发条件。
- 状态变化。
- 玩家可见反馈。
- 派系或 NPC 反应。
- 失败或副作用。
- 验收标准。

缺少这些字段的内容只能作为灵感，不进入 MVP 实现。

### 5.4 当前程序阶段边界

角色系统是策划 Phase 1，但程序侧仍在 Phase 2。以下内容可以先写入策划表，但必须等待架构师确认：

- `PlayerRole` 是否进入核心 `WorldSnapshot`。
- 初始已知地图如何映射到 `visibility`。
- 初始派系关系是否新增 relation model。
- 角色特殊行动是否作为 command、event hook 或 scenario modifier。
- 个人目标是否进入 quest / history 系统。

## 6. PlayerRole Content Schema

### 6.1 最小字段

```text
id
name
archetype
tags
phase
mvpScope
fantasy
startingNodeId
visitedNodeIds
knownNodeIds
knownEdgeIds
startingFactionRelations
attributes
specialActions
restrictions
personalGoals
openingHook
stateChanges
playerVisibleFeedback
factionOrNpcReaction
failureOrSideEffect
scenarioSolutionBias
acceptanceCriteria
architectReviewNeeds
```

### 6.2 稳定 ID 规则

角色 ID 使用主策划建议格式：

- `role.rootline_surveyor`
- `role.strata_engineer`
- `role.exiled_mediator`
- `role.breach_prospector`

当前代码中的派系 ID 暂为 hyphen 风格，例如 `echo-cult`。策划文档采用 dot 风格作为长期稳定内容 ID；是否迁移代码侧 ID，交由架构师确认。

### 6.3 属性轴与建议范围

属性只用于表达角色倾向和内容条件，不直接定义最终公式。

范围：`0-5`。

```text
survey: 读图、探索、隐藏连接和风险识别能力
engineering: 稳定性判断、加固、坍塌预测能力
mediation: 派系调停、禁忌解释、关系修复能力
breach: 开路、破壁、处理封闭边能力
riskSense: 行动前读懂代价和副作用的能力
```

验收要求：

- 角色差异不能只由属性决定。
- 属性必须和出生点、初始信息、行动、关系或个人目标至少两项共同生效。

### 6.4 初始派系关系建议范围

关系值用于策划表达，最终模型待架构师确认。

范围：`-100` 到 `100`。

建议语义：

- `60` 到 `100`：信任或保护。
- `20` 到 `59`：友好。
- `-19` 到 `19`：中立或观望。
- `-59` 到 `-20`：怀疑。
- `-100` 到 `-60`：敌意或禁忌追责。

MVP 角色关系先覆盖三个现有派系：

- `faction.echo_cult`
- `faction.excavator_union`
- `faction.strata_guild`

## 7. First Four Player Roles

### 7.1 根脉测绘员

```text
id: role.rootline_surveyor
name: 根脉测绘员
archetype: cartographer / structure reader
tags: exploration, visibility, topology, low-risk
phase: design.phase_1
mvpScope: core
fantasy: 我能读懂地下世界的结构，提前看见别人看不见的连接与风险。
startingNodeId: rootwell
visitedNodeIds: rootwell
knownNodeIds: rootwell, echo-vault, spore-market
knownEdgeIds: rootwell-echo, rootwell-spore, spore-sealed
startingFactionRelations:
  faction.echo_cult: 10
  faction.excavator_union: 0
  faction.strata_guild: 15
attributes:
  survey: 5
  engineering: 2
  mediation: 2
  breach: 1
  riskSense: 4
specialActions:
  - action.deep_survey
  - action.trace_unstable_edge
restrictions:
  - 强行开路效率低，且更容易暴露自身缺乏工程授权。
personalGoals:
  - goal.map_three_route_decisions
  - goal.finish_with_explained_history
openingHook: Strata Guild 借调测绘员重新确认 Rootwell 周边旧图是否仍可信。
stateChanges:
  - 开局更多节点和边为 known。
  - 调查行动可追加 warning 或 survey 事件，解释边风险和未知邻接。
playerVisibleFeedback:
  - 地图标注显示“旧图可信”“结构读数不足”“疑似封闭通路”。
factionOrNpcReaction:
  - Strata Guild 较愿意相信测绘报告。
  - Excavator Union 会催促测绘员把信息转成开路许可。
failureOrSideEffect:
  - 如果反复等待不处理危机，事件日志应提示“测得风险但未干预”。
scenarioSolutionBias:
  - 倾向先扩大信息，再选择低代价拓扑改变。
acceptanceCriteria:
  - 同一 seed 中，测绘员开局已知节点数多于破壁开拓者。
  - 至少 1 个重大行动前反馈能解释风险来源。
  - 不依赖战斗或成长树也能形成不同解法。
architectReviewNeeds:
  - 初始 known / visited visibility 是否由 role 初始化。
  - survey action 是否作为 command 或 inspect modifier。
```

核心行动草案：

| id | 触发条件 | 系统效果 | 玩家反馈 | 副作用 |
| --- | --- | --- | --- | --- |
| `action.deep_survey` | 当前节点 visited，邻接边至少 1 条 unknown / blocked / high stress | 揭示 1 条邻接边的 state、traversalCost 或 stabilityStress | “测绘线显示此处并非死路，压力集中在东侧封闭脉。” | 推进 tick 或消耗场景行动窗口，可能错过危机 |
| `action.trace_unstable_edge` | 已知边连接低稳定性节点 | 生成 warning event，标记潜在 collapse 风险 | “旧图与新裂缝不一致，继续开路可能牵动 Echo Vault。” | 不直接修复问题，信息优势需要后续行动兑现 |

### 7.2 地层工程师

```text
id: role.strata_engineer
name: 地层工程师
archetype: stability specialist / infrastructure keeper
tags: stability, reinforcement, risk-control, strata-guild
phase: design.phase_1
mvpScope: core
fantasy: 我能判断哪些通路能承受文明的重量，哪些连接会让整片区域一起崩塌。
startingNodeId: rootwell
visitedNodeIds: rootwell
knownNodeIds: rootwell, spore-market
knownEdgeIds: rootwell-echo, rootwell-spore, spore-sealed
startingFactionRelations:
  faction.echo_cult: 0
  faction.excavator_union: -15
  faction.strata_guild: 45
attributes:
  survey: 3
  engineering: 5
  mediation: 1
  breach: 2
  riskSense: 5
specialActions:
  - action.stress_test
  - action.emergency_shoring
restrictions:
  - 激进开路会造成更高声誉风险，因为其他派系默认工程师“知道后果”。
personalGoals:
  - goal.prevent_critical_collapse
  - goal.stabilize_two_stressed_routes
openingHook: Strata Guild 要求工程师证明 Rootwell 的开放边仍能维持资源流。
stateChanges:
  - 开局能看到更多 stabilityStress 和节点 stability 解释。
  - 加固行动可降低边压力或提高节点稳定性，具体公式待审。
playerVisibleFeedback:
  - 边详情显示“应力过高”“可临时支护”“不建议开掘”。
factionOrNpcReaction:
  - Strata Guild 信任工程判断。
  - Excavator Union 不满过度保守的封闭建议。
failureOrSideEffect:
  - 如果工程师批准高风险开路后发生坍塌，关系惩罚应高于其他角色。
scenarioSolutionBias:
  - 倾向先稳定关键节点，再开放或封闭边。
acceptanceCriteria:
  - 工程师至少有 1 个非封路的坍塌风险处理方式。
  - 同一低稳定性问题，工程师能得到比破壁开拓者更明确的风险说明。
  - 失败时事件日志能说明“工程责任”而不是随机惩罚。
architectReviewNeeds:
  - 临时支护是否需要新增 edge / node modifier。
  - 角色责任是否影响 faction relation event 权重。
```

核心行动草案：

| id | 触发条件 | 系统效果 | 玩家反馈 | 副作用 |
| --- | --- | --- | --- | --- |
| `action.stress_test` | 已知边 state 为 open 或 blocked | 显示或记录 stabilityStress，必要时生成 warning event | “支护梁回声过短，这条边正在把压力传给 Rootwell。” | 可能让保守派要求立刻封闭，制造政治压力 |
| `action.emergency_shoring` | 节点 stability 低于 50 或边 stabilityStress 高于 6 | 临时降低坍塌风险或延迟 collapse check，最终公式待审 | “临时支护撑住了裂缝，但木料和人手正在耗尽。” | 可能消耗资源或降低 Excavator Union 好感 |

### 7.3 放逐调停者

```text
id: role.exiled_mediator
name: 放逐调停者
archetype: faction mediator / taboo interpreter
tags: diplomacy, relations, taboo, border-start
phase: design.phase_1
mvpScope: core
fantasy: 我不能轻易改变石头，但能让彼此恐惧的人暂时相信同一条通路不会毁掉他们。
startingNodeId: spore-market
visitedNodeIds: spore-market
knownNodeIds: rootwell, echo-vault, spore-market, sealed-vein
knownEdgeIds: rootwell-spore, spore-sealed
startingFactionRelations:
  faction.echo_cult: 20
  faction.excavator_union: 20
  faction.strata_guild: -10
attributes:
  survey: 2
  engineering: 1
  mediation: 5
  breach: 1
  riskSense: 3
specialActions:
  - action.threshold_parley
  - action.translate_taboo
restrictions:
  - 无法独自处理高强度工程风险，强行开路代价高。
personalGoals:
  - goal.prevent_two_faction_break
  - goal.reconcile_taboo_after_topology_change
openingHook: 调停者被放逐到 Spore Market，仍记得 Echo Cult 和 Excavator Union 都不愿公开承认的旧协议。
stateChanges:
  - 开局知道更多派系解释和禁忌，但不一定知道准确工程风险。
  - 调停行动可降低一次拓扑改变造成的关系冲击。
playerVisibleFeedback:
  - 派系态度解释显示“他们不是反对开路，而是反对未经见证的开路”。
factionOrNpcReaction:
  - Echo Cult 和 Excavator Union 初始愿意听取调停，但 Strata Guild 怀疑其缺乏结构授权。
failureOrSideEffect:
  - 调停失败会把中立争议升级为公开立场，未来关系修复更难。
scenarioSolutionBias:
  - 倾向先解释禁忌和利益，再进行低冲击拓扑改变。
acceptanceCriteria:
  - 调停者至少能让一次高争议拓扑行动产生不同关系后果。
  - 玩家能读到派系为什么接受、拒绝或误解调停。
  - 调停不是万能跳过代价，失败必须留下历史记录。
architectReviewNeeds:
  - 是否已有 relation model 支持一次性关系缓冲。
  - taboo explanation 是否进入 event log 或 faction memory。
```

核心行动草案：

| id | 触发条件 | 系统效果 | 玩家反馈 | 副作用 |
| --- | --- | --- | --- | --- |
| `action.threshold_parley` | 至少两个派系受同一边状态影响，且关系未达到敌意阈值 | 降低一次拓扑行动的关系惩罚，或增加等待窗口 | “双方同意先派见证人站在门槛处，直到下一次震动。” | 失败时双方都会记录玩家偏袒 |
| `action.translate_taboo` | 即将打开、封闭或坍塌的边触及派系禁忌 | 生成可见解释，提示替代代价或补偿条件 | “Echo Cult 要求保留墙面回声，Union 要求保证氧路。” | 需要牺牲时间、资源或另一个派系好感 |

### 7.4 破壁开拓者

```text
id: role.breach_prospector
name: 破壁开拓者
archetype: high-risk path opener / frontier agent
tags: breach, expansion, collapse-risk, excavator-union
phase: design.phase_1
mvpScope: core
fantasy: 我能把死路变成活路，即使整座洞穴都会记住这次破壁。
startingNodeId: sealed-vein
visitedNodeIds: sealed-vein
knownNodeIds: sealed-vein, spore-market
knownEdgeIds: spore-sealed
startingFactionRelations:
  faction.echo_cult: -30
  faction.excavator_union: 50
  faction.strata_guild: -20
attributes:
  survey: 1
  engineering: 2
  mediation: 0
  breach: 5
  riskSense: 2
specialActions:
  - action.force_breach
  - action.risky_shortcut
restrictions:
  - 更容易触发坍塌、禁忌违反和派系敌意。
personalGoals:
  - goal.open_sealed_route
  - goal.survive_consequence_chain
openingHook: Excavator Union 把开拓者送进 Sealed Vein，要求其打开通往 Spore Market 的封闭脉。
stateChanges:
  - 开局处于隔离或半隔离位置。
  - 强行开路可以更早改变边状态，但会提高风险或关系代价。
playerVisibleFeedback:
  - 行动按钮和日志明确显示“快速、危险、会被记住”。
factionOrNpcReaction:
  - Excavator Union 支持冒险开路。
  - Echo Cult 和 Strata Guild 对破壁行动更敏感。
failureOrSideEffect:
  - 强行开路可能造成 collapse event、稳定性下降、派系禁忌惩罚或资源污染。
scenarioSolutionBias:
  - 倾向快速打开封闭边，以即时收益换长期风险。
acceptanceCriteria:
  - 开拓者可以比其他角色更早打开至少 1 条 blocked edge。
  - 开拓者的成功和失败都必须显著改变历史日志。
  - 高风险行动不能变成默认最优解，必须有可见代价。
architectReviewNeeds:
  - force breach 是否允许 blocked -> open，并追加 stress。
  - 是否需要 role-specific command 权限或 action modifier。
```

核心行动草案：

| id | 触发条件 | 系统效果 | 玩家反馈 | 副作用 |
| --- | --- | --- | --- | --- |
| `action.force_breach` | 已知边 state 为 blocked，且至少一端节点 visited / known | 尝试将 blocked edge 打开，追加 stress 或 warning event | “封层被破开，热气和旧尘同时涌出。” | 可能降低两端节点 stability，触发禁忌或关系惩罚 |
| `action.risky_shortcut` | 目标节点不可达但存在已知 blocked edge | 提供快速连通路径 | “这不是安全路线，但能在饥荒前抵达。” | 增加未来 collapse 权重，且 Strata Guild 追责 |

## 8. Initial Role Matrix

### 8.1 开局差异总表

| 角色 | 出生点 | 已访问 | 初始已知重点 | 强项 | 明显弱点 |
| --- | --- | --- | --- | --- | --- |
| 根脉测绘员 | `rootwell` | `rootwell` | 周边节点、旧图、封闭边线索 | 探索和风险识别 | 无法快速开路 |
| 地层工程师 | `rootwell` | `rootwell` | 边应力、稳定性读数 | 加固和坍塌预警 | 外交弱，过度保守会激怒开拓派 |
| 放逐调停者 | `spore-market` | `spore-market` | 派系禁忌、争议边利益 | 调停和关系缓冲 | 工程能力弱 |
| 破壁开拓者 | `sealed-vein` | `sealed-vein` | 封闭边和扩张机会 | 快速开路 | 坍塌和禁忌风险高 |

### 8.2 初始派系关系矩阵

| 角色 | Echo Cult | Excavator Union | Strata Guild | 设计意图 |
| --- | ---: | ---: | ---: | --- |
| 根脉测绘员 | 10 | 0 | 15 | 中立读图者，适合第一局 |
| 地层工程师 | 0 | -15 | 45 | 稳定性权威，和开拓派天然拉扯 |
| 放逐调停者 | 20 | 20 | -10 | 能进入争议，但缺乏工程背书 |
| 破壁开拓者 | -30 | 50 | -20 | 高风险扩张者，天然制造冲突 |

### 8.3 同一场景的解法差异

| 场景问题 | 测绘员解法 | 工程师解法 | 调停者解法 | 开拓者解法 |
| --- | --- | --- | --- | --- |
| `spore-sealed` 阻塞导致 Sealed Vein 资源危机 | 先调查替代连接和风险，再选择开路或等待 | 先支护 Spore Market，再打开或继续封闭 | 让 Union 接受延迟开路，换取 Echo / Strata 见证 | 直接强行开路，承担坍塌和禁忌代价 |
| Echo Cult 反对破坏墙体 | 标注记忆墙范围，寻找低冲击边 | 证明某条边压力较低但需支护 | 解释保留回声面的补偿条件 | 无视禁忌破壁，换取短期资源 |
| Rootwell 稳定性下降 | 找出压力来源 | 临时支护并建议封闭高压边 | 调解封路造成的资源分配冲突 | 打开新路分流，但可能扩大风险 |

## 9. Personal Goal Templates

个人目标必须是状态目标，不是固定剧情脚本。

### 9.1 目标字段

```text
id
name
roleId
trigger
initialState
targetState
successCriteria
failureCriteria
acceptableCost
stateChanges
playerVisibleFeedback
historySummaryLine
acceptanceCriteria
```

### 9.2 首批目标草案

| id | roleId | 目标状态 | 失败条件 | 历史摘要方向 |
| --- | --- | --- | --- | --- |
| `goal.map_three_route_decisions` | `role.rootline_surveyor` | 记录至少 3 次拓扑决策的原因和后果 | 关键边改变但没有任何解释事件 | “测绘员留下了可被后人理解的地下史。” |
| `goal.finish_with_explained_history` | `role.rootline_surveyor` | 结局摘要包含至少 2 条玩家行动和系统反应的因果链 | 结局只列出结果，不解释原因 | “旧图被修正，新的连接获得名字。” |
| `goal.prevent_critical_collapse` | `role.strata_engineer` | 核心节点群在目标 tick 前无 critical collapse | 核心开放边坍塌且无 warning / shoring 记录 | “工程师保住了通路，也背负了封路的怨言。” |
| `goal.stabilize_two_stressed_routes` | `role.strata_engineer` | 两条高压力边被支护、封闭或降险 | 高压力边连续恶化且未处理 | “地层被重新分配了重量。” |
| `goal.prevent_two_faction_break` | `role.exiled_mediator` | 两个受同一拓扑变化影响的派系未跌入敌意 | 一次争议行动后关系跌破敌意阈值 | “放逐者让门槛成为谈判桌。” |
| `goal.reconcile_taboo_after_topology_change` | `role.exiled_mediator` | 禁忌违反后通过补偿或解释降低后续冲突 | 禁忌违反直接引发不可逆敌意 | “被打破的墙仍留下可被承认的回声。” |
| `goal.open_sealed_route` | `role.breach_prospector` | 至少 1 条 blocked edge 被打开并产生资源或迁徙后果 | 开路造成连续 collapse 且未带来可见收益 | “封闭脉被撕开，文明得到氧气也得到裂缝。” |
| `goal.survive_consequence_chain` | `role.breach_prospector` | 高风险开路后至少处理 1 个副作用 | 副作用被忽略并导致核心节点失稳 | “开拓者没有停在第一声爆响之后。” |

## 10. Player-Visible Feedback Standards

角色反馈必须让玩家理解“为什么这个角色看见不同、能做不同、承担不同代价”。

### 10.1 反馈类型

| 类型 | 用途 | 示例 |
| --- | --- | --- |
| 开局摘要 | 解释角色身份带来的初始信息 | “你带着 Rootwell 的旧测绘卷，知道 Spore Market 后方有一条封闭脉。” |
| 行动前风险提示 | 解释行动可能造成的拓扑、资源、关系或稳定性后果 | “强行破壁会打开资源通路，也会把 Echo Cult 的禁忌推到明面上。” |
| 行动后事件 | 记录世界状态变化 | “Spore-Sealed 被破开，热量开始流动，Sealed Vein 的饥荒警告解除。” |
| 派系解释 | 解释同一事实的不同解读 | “Strata Guild 指责这不是开路，而是不受控的应力转移。” |
| 历史摘要 | 让失败或成功进入文明史 | “这条通路后来被称为放逐者门槛，因为它第一次让两个敌对派系同意共同见证。” |

### 10.2 文本约束

- 文本必须解释状态原因，不只制造气氛。
- 文本必须引用玩家行动、派系信仰、节点状态或边状态中的至少一类。
- 重要反馈必须能对应到事件、关系、资源、稳定性、可见性或历史摘要。

## 11. Candidate Engineering Demand Tickets

以下是执行策划提交给架构师审查的候选需求，不代表已经批准实现。

### 11.1 支持角色初始地图信息差

```text
ticketId: design.req.role.starting_knowledge
title: 支持玩家角色初始已知地图差异
requesterRole: 执行策划
designGoal: 让不同角色通过已知节点、已访问节点和已知边产生开局差异
playerValue: 测绘员能提前规划路线，开拓者从隔离处开始承担未知风险
affectedSystems: world seed, visibility, scenario initialization, debug UI
requiredState: 每个角色可定义 startingNodeId, visitedNodeIds, knownNodeIds, knownEdgeIds
requiredDataFields: roleId, startingNodeId, visitedNodeIds, knownNodeIds, knownEdgeIds
triggerExamples: 开始新场景时根据 roleId 初始化 visibility 和 edge knowledge
expectedFeedback: 开局摘要和 debug UI 显示角色已知区域来源
mvpPriority: high
nonGoals: 不做动态侦察技能树，不做完整雾区 UI 美术
acceptanceCriteria: 同一 seed 不同角色初始可见节点不同，且事件日志解释开局信息来源
needsArchitectReview: yes
```

### 11.2 支持角色初始派系关系

```text
ticketId: design.req.role.initial_faction_relations
title: 支持玩家角色初始派系关系差异
requesterRole: 执行策划
designGoal: 让角色身份影响派系对同一拓扑行动的解释
playerValue: 工程师、调停者和开拓者面对同一封闭边时有不同社会代价
affectedSystems: faction state, relation model, event log, scenario initialization
requiredState: roleId 可提供 faction relation deltas 或 starting relation profile
requiredDataFields: roleId, factionId, relationValue or relationDelta, reason
triggerExamples: 开始场景时初始化关系；拓扑行动后根据 role relation profile 调整事件权重
expectedFeedback: 派系态度面板或事件日志说明“因你的身份，他们更信任/怀疑该行动”
mvpPriority: high
nonGoals: 不做完整外交系统，不做对话树
acceptanceCriteria: 同一拓扑改变在不同角色下产生至少两种不同派系反应，并可读地解释原因
needsArchitectReview: yes
```

### 11.3 支持角色特殊行动

```text
ticketId: design.req.role.special_actions
title: 支持角色特殊行动作为拓扑干预或信息动作
requesterRole: 执行策划
designGoal: 让角色玩法差异从可执行行动体现，而不是只靠开局数值
playerValue: 玩家能用不同角色处理同一危机，形成测绘、加固、调停或破壁路线
affectedSystems: command system, graph rules, event log, tick consequences, debug UI
requiredState: roleId 可决定可用 actionIds 和行动限制
requiredDataFields: actionId, roleId, trigger, stateChanges, sideEffects, feedback
triggerExamples: blocked edge 可触发 force_breach；low stability node 可触发 emergency_shoring
expectedFeedback: 行动前显示风险，行动后生成结构化事件
mvpPriority: high
nonGoals: 不做技能树，不做数值成长，不做战斗技能
acceptanceCriteria: 四个首批角色每个至少有 1 个角色专属或角色强化行动，且行动改变信息、边状态、稳定性或关系
needsArchitectReview: yes
```

### 11.4 支持角色个人目标进入历史摘要

```text
ticketId: design.req.role.personal_goals
title: 支持角色个人目标与结局历史摘要
requesterRole: 执行策划
designGoal: 让角色选择影响一局结束时玩家讲述的地下文明史
playerValue: 同一场景通关后，不同角色有不同成功、失败和代价评价
affectedSystems: quest/objective layer, event history, summary generation
requiredState: roleId 可定义 personalGoalIds，目标由世界状态判定
requiredDataFields: goalId, roleId, trigger, targetState, successCriteria, failureCriteria, historySummaryLine
triggerExamples: scenario end, key edge state changed, faction relation threshold crossed
expectedFeedback: 结局摘要列出角色目标完成与失败原因
mvpPriority: medium
nonGoals: 不做完整主线剧情，不做复杂个人剧情树
acceptanceCriteria: 同一场景中至少两个角色生成不同个人目标评价，且引用实际世界状态
needsArchitectReview: yes
```

## 12. Round Plan

Goal 2 建议 3 轮完成；本文件完成 Round 1 首版。

### Round 1：角色系统执行策划首版

目标：

- 定义 `PlayerRole` 内容字段。
- 产出 4 个首批角色。
- 产出角色行动草案、个人目标草案、初始关系矩阵。
- 标出需要架构师确认的候选需求。

影响文件：

- `docs/ROOTLINE_Player_Role_System_Design_CN.md`

验收标准：

- 每个角色至少覆盖 3 个差异维度。
- 每个角色至少有 1 个拓扑相关行动。
- 每个角色有开局状态、关系、目标、反馈和副作用。
- 候选新系统能力已写成需求工单。

### Round 2：角色内容 QA 与场景映射

目标：

- 把四个角色映射到首批高密度场景。
- 校对角色是否都能在同一场景产生至少 2 种不同解法。
- 修正 ID、字段命名和目标模板。

建议影响文件：

- `docs/ROOTLINE_Player_Role_System_Design_CN.md`
- 后续可能新增 `docs/ROOTLINE_Role_Scenario_QA_CN.md`

Round 2 交付物：

- `docs/ROOTLINE_Role_Scenario_QA_CN.md`

Round 2 结论：

- 四个首批角色均在至少 2 个候选场景中形成不同解法路径。
- 八个角色行动均已追踪到触发条件、状态变化、玩家反馈和副作用。
- 后续 Round 3 应把角色字段和行动拆成 content-only、scenario initialization、graph command、relation model、quest/history dependency 五类，交由架构师审查。

验收标准：

- 每个角色在至少 2 个场景中有不同解法路径。
- 每个行动都能追踪到状态变化或玩家可见反馈。
- 没有 lore-only 角色条目。

### Round 3：架构审查准备与实现分层

目标：

- 将需求拆成“纯内容表可先写”“需要场景初始化支持”“需要新 command”“需要 relation / quest 系统”四类。
- 准备给架构师的审查清单。

验收标准：

- 每个候选字段都有玩家价值、触发例子和验收标准。
- 明确哪些内容可在当前程序 Phase 2 后接入，哪些要等 Phase 3/4/5。
- 执行程序不需要靠猜测实现角色差异。

## 13. Round Self-Check Standards

执行策划每轮必须检查：

### 13.1 目标检查

- 本轮是否完成可交付文档或内容表。
- 是否仍处于角色系统目标内。
- 是否未提前进入派系圣经、事件库或完整场景制作。

### 13.2 系统化检查

- 是否有稳定 ID。
- 是否有字段、触发条件、状态变化和反馈。
- 是否标出数值范围或关系范围。
- 是否能交给架构师审查。

### 13.3 玩家感知检查

- 玩家是否能看见角色差异。
- 角色差异是否改变选择、代价或风险。
- 行动后是否有事件、日志、关系、资源、稳定性或历史反馈。

### 13.4 拓扑核心检查

- 每个角色是否让连接、切断、封闭、坍塌、开路、可达性或隔离更重要。
- 是否存在至少一个同场景不同解法。
- 是否避免把角色写成单纯背景。

### 13.5 协议检查

- 未直接要求程序实现未经审查的数据契约。
- 新字段已进入候选需求工单。
- 没有把 UI 当作世界事实来源。
- 没有要求 Phase 2 承担完整 CRPG 系统。

## 14. Debug Standards

角色设计失败时按以下方式修复：

1. 说清失败点：差异弱、不可实现、不可读、偏离拓扑、只有 lore、缺少代价或缺少验收。
2. 回到角色字段，检查出生点、初始信息、行动、关系和个人目标是否至少命中 3 类。
3. 找最小修复：
   - 差异弱：补充开局信息或行动限制。
   - 不可实现：降级为候选需求工单。
   - 不可读：补行动前风险提示和事件日志文本。
   - 没有代价：加入关系、稳定性、资源、时间或历史副作用。
   - 偏离拓扑：把目标改为边状态、节点可达性、稳定性或隔离问题。
4. 重新跑自检。
5. 需要程序能力时，提交给架构师，不直接要求执行程序实现。

## 15. Content Quality Constraints

- 角色必须是玩法入口，不是职业皮肤。
- 不为单个角色创造无法复用的一次性规则。
- 不把角色差异压缩成属性数值。
- 不让任何角色拥有无代价最优解。
- 不把调停写成跳过派系系统。
- 不把破壁写成永远正确的快速路线。
- 不把工程写成单纯修复按钮。
- 不把测绘写成只揭示地图而不影响决策。
- 所有重要反馈都要能指向状态、行动、派系信仰或历史。

## 16. Verification Methods

本轮文档自检方法：

- 检查文件存在于 `docs/`。
- 检查包含目标、非目标、角色路由、字段模板、4 个角色、关系矩阵、行动草案、个人目标、需求工单、轮次计划、自检标准和交接 prompt。
- 检查每个角色至少包含 3 个差异维度。
- 检查每个角色至少有 1 个拓扑相关行动。
- 运行项目级验证，确认文档新增未破坏现有代码。

建议命令：

```sh
npm run verify
```

## 17. Risks and Open Questions

- 当前程序无 role model，需架构师决定角色是 scenario 初始化参数、world state 字段，还是 UI/session 层选择。
- 当前派系模型无 relation value，角色初始关系需要等待派系系统架构。
- 当前 command 系统尚未完整成型，角色行动只能先作为设计草案。
- 当前 quest/history 系统未实现，个人目标应先保留为状态目标模板。
- 当前 seed scenario 只有 3 个派系，长期 5-6 个首批派系会影响角色关系矩阵。
- ID 风格存在策划 dot 格式与现有代码 hyphen 格式差异，需架构师统一。

## 18. Handoff Prompt for the Next AI

```text
Use goal-driven execution for ROOTLINE.

Session role:
执行策划

Goal:
Continue Goal 2 player role system content work from
docs/ROOTLINE_Player_Role_System_Design_CN.md.

Required reading:
- docs/ROOTLINE_Lead_Design_Principles_CN.md
- docs/ROOTLINE_Player_Role_System_Design_CN.md
- docs/ROOTLINE_Design_Work_Roadmap_CN.md
- docs/ROOTLINE_Lead_Designer_Handoff_CN.md
- docs/ROOTLINE_Project_Plan.md
- docs/ROOTLINE_Phase_2_Architecture_Design_CN.md

First target:
Run Round 2: role content QA and scenario mapping.

Execution rules:
1. Keep the session role as 执行策划.
2. Do not implement code or invent final architecture contracts.
3. Convert any new system need into a demand ticket with player value, fields, triggers, feedback and acceptance criteria.
4. Verify every role has at least 3 difference dimensions: starting location, initial information, available actions, faction relations, personal goals.
5. Verify every action affects topology, visibility, stability, faction relations, resources or history.
6. End the round with self-check, content review, project verification when available, commit and push.
```
