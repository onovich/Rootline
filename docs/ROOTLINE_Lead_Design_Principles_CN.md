# ROOTLINE 主策划设计原则与 Goal 1 计划

## 1. Objective

本阶段目标是完成主策划接手后的认知对齐，明确 ROOTLINE 的核心体验、玩家幻想、设计支柱、MVP 体验验收标准和非目标，并把这些原则保存为后续角色、派系、事件、任务、区域和场景设计的共同判断基准。

一句话目标：

> 让每一次连接或切断，都像是在改写一段地下文明史。

本文件既是主策划 Goal 1 的产出，也是后续执行策划、架构师和执行程序判断设计是否偏航的本地依据。

## 2. Non-Goals

本阶段不做以下内容：

- 不设计完整角色成长树。
- 不设计完整对话树。
- 不扩写大批量派系、NPC、事件或遗物内容。
- 不新增程序数据契约。
- 不要求程序侧改变 Phase 2 架构。
- 不决定最终美术风格。
- 不设计完整战斗系统。
- 不把单次剧情脚本当成 MVP 核心。

本阶段可以定义设计原则、验收标准、内容边界和需求工单格式，但任何新增系统能力必须后续交由架构师确认，再交给执行程序实现。

## 3. Required Context

制定本文件时必须对齐以下资料：

- `docs/ROOTLINE_Game_Design_Document.md`
- `docs/ROOTLINE_Technical_Design_Document.md`
- `docs/ROOTLINE_Project_Plan.md`
- `docs/ROOTLINE_Development_Roadmap_CN.md`
- `docs/ROOTLINE_Design_Work_Roadmap_CN.md`
- `docs/ROOTLINE_Lead_Designer_Handoff_CN.md`
- `docs/ROOTLINE_Phase_2_Architecture_Design_CN.md`
- `README.md`

当前项目共同认知：

- ROOTLINE 是 simulation-first 的地下文明 CRPG。
- 核心世界对象是可变洞穴图，不是传统 tile map。
- 节点是洞穴，边是通道。
- 玩家通过探索、理解信仰、改变连接关系，影响资源、稳定性、派系关系、迁徙、冲突和历史。
- ASCII/debug 表现优先于最终美术。
- 任务是状态转化目标，事件是状态触发结果。
- AI 生成内容必须被模拟验证。

## 4. Session Role and Routing Decision

当前会话角色：`主策划`。

角色路由结论：

- 主策划负责核心体验、玩家幻想、内容方向、策划标准和体验验收。
- 主策划不直接决定代码实现、模块边界、测试框架或存档格式。
- 主策划可以提出系统需求，但必须先给出体验目标、字段草案、触发条件、状态变化和验收标准，再交由架构师审查。
- 执行策划后续只能在主策划给出的模板和边界内扩写内容。
- 执行程序只应实现经主策划和架构师确认的数据契约。

本文件不替代架构文档，不直接授权程序实现新系统。

## 5. Design Constraints

### 5.1 拓扑优先

任何 MVP 设计都必须至少回答一个问题：

- 它如何让连接、切断、封闭、坍塌、开路、可达性或隔离变得重要？

不能服务拓扑核心的内容可以作为长期素材保留，但不得成为 MVP 主线工作。

### 5.2 模拟优先

任何进入生产的设计必须回答：

- 它改变哪个模拟状态？
- 它由什么状态触发？
- 玩家如何感知它？
- 它如何影响未来 tick、资源、稳定性、派系关系、迁徙、冲突或历史？

如果一个内容既不改变状态，也不帮助玩家理解状态，则不进入 MVP。

### 5.3 信仰驱动行为

派系差异不能只靠名称、文本或阵营颜色。每个派系的信仰必须约束行为：

- 偏好的拓扑变化。
- 禁忌的拓扑变化。
- 资源优先级。
- 外交反应。
- 对玩家行动的解释方式。

同一条边被打开、封闭或坍塌时，不同派系必须能给出不同反应。

### 5.4 玩家可读性优先

ROOTLINE 的复杂度必须被玩家看见。事件日志、节点状态、派系态度和历史摘要需要解释：

- 发生了什么。
- 为什么发生。
- 由哪个状态或行动触发。
- 可能带来什么后果。

不可读的深层模拟不是好玩，只是噪声。

### 5.5 小角色入口，大内容世界

MVP 角色数量可以克制，但世界内容必须可扩展：

- 首批角色：3-4 个。
- 首批派系：5-6 个。
- 首批区域生态：6-8 种。
- 首批事件模板：50-80 个。
- 首批任务目标类型：20-30 个。
- 首批重要 NPC 原型：约 30 个。
- 首批遗物和旧世界内容：30-50 个。
- 首批高密度场景：3 个。

丰富度来自可复用内容池，不来自一次性剧情堆砌。

## 6. Core Design Principles

### 6.1 Core Experience Definition

ROOTLINE 的核心体验是：

> 玩家在一个会记住拓扑变化的地下文明中，通过有限信息和有限干预，改变洞穴连接关系，并观察资源、信仰、派系和历史因此重组。

玩家不是全知神，也不是传统英雄。玩家更接近测绘者、调停者、工程干预者或危险开拓者。玩家的力量来自理解结构，而不是单纯战斗数值。

### 6.2 Player Fantasy

玩家幻想由五层组成：

1. 我能读懂地下世界的结构。
2. 我能看见别人看不见的连接与风险。
3. 我的一条通道决定了一个群体的生存、信仰或迁徙。
4. 我无法完全控制后果，但能理解后果为什么发生。
5. 每局结束时，我能讲出这个地下文明如何被我改变。

### 6.3 Design Pillars

#### Pillar A：拓扑即政治

通道不是地图连线，而是权力、资源、禁忌和安全的重新分配。

设计要求：

- 每个关键任务至少包含一个拓扑目标或拓扑代价。
- 每个主要派系至少有一个与连接或隔离相关的信仰判断。
- 每个高密度场景至少提供两种拓扑解法。

#### Pillar B：模拟产生叙事

叙事不应主要来自固定剧情推进，而应来自可解释的状态变化。

设计要求：

- 事件必须来自世界状态。
- 任务必须定义初始状态、目标状态、成功条件、失败条件和可接受代价。
- 历史日志必须能追踪玩家行动和系统反应。

#### Pillar C：信仰改变行为

派系的信仰必须改变它们对同一事实的解释。

设计要求：

- 每个派系必须有禁忌、偏好、资源需求和外交逻辑。
- 禁忌被违反时必须影响关系或未来行为。
- 派系反应必须能被事件日志解释。

#### Pillar D：选择必须有代价

玩家每次有意义的干预都应伴随取舍：

- 开路可能带来资源，也可能传播信仰、疾病、敌意或坍塌风险。
- 封闭可能保护一个节点，也可能制造饥荒、孤立或政治敌意。
- 调停可能降低冲突，也可能暴露玩家立场。
- 等待可能让风险自然演化，也可能错过窗口期。

#### Pillar E：失败也要形成历史

失败不是简单重开提示，而应成为地下文明史的一部分。

设计要求：

- 失败条件必须可解释。
- 失败后果应影响资源、派系、节点或历史摘要。
- 场景失败也应留下有意义的结局描述。

### 6.4 MVP Experience Standard

MVP 的最小可玩体验必须证明：

1. 玩家能探索并理解一个小型洞穴图。
2. 玩家能遇到至少三个信仰不同的派系。
3. 玩家能改变至少一种边状态，例如 open、blocked、collapsed。
4. 拓扑变化能改变资源、稳定性、派系态度、迁徙、冲突或事件。
5. 事件日志能解释主要变化。
6. 同一场景下，不同角色至少有两种明显不同解法。
7. 一局结束后能生成可讲述的历史摘要。

### 6.5 Good Play Criteria

一个设计被视为“好玩”，需要满足至少 5 条：

- 玩家能在行动前形成判断。
- 行动有可见反馈。
- 后果不完全可控，但可解释。
- 至少存在两种解法。
- 有明确代价或风险。
- 影响未来状态，而不只是播放文本。
- 与角色、派系、区域、事件或任务中的至少两类内容交叉。
- 能在下一局以不同组合再次产生价值。

### 6.6 Boring Content Criteria

以下内容应暂缓或退回：

- 只提供 lore，不改变状态。
- 只有唯一解。
- 只有数值奖励，没有世界后果。
- 与拓扑无关，却占用 MVP 主要篇幅。
- 玩家无法理解触发原因。
- 需要复杂新系统才能成立，但没有足够核心价值。
- 只为单次剧情服务，不能扩展成内容池。

## 7. Data, Content, and Handoff Design

### 7.1 Minimum Design Entry Fields

所有进入执行策划或程序实现阶段的关键条目，应尽量包含：

- `id`
- `name`
- `type`
- `tags`
- `phase`
- `mvpScope`
- `trigger`
- `initialState`
- `targetState`
- `stateChanges`
- `playerVisibleFeedback`
- `factionOrNpcReaction`
- `failureOrSideEffect`
- `example`
- `acceptanceCriteria`

缺少这些字段的内容只能作为灵感素材，不得直接交给程序实现。

### 7.2 Stable ID Rules

建议 ID 格式：

- 角色：`role.rootline_surveyor`
- 派系：`faction.echo_cult`
- 区域：`region.echo_hall`
- 事件：`event.collapse_warning`
- 任务：`quest.connect_isolated_factions`
- NPC：`npc.echo_warden_01`
- 遗物：`relic.old_lift_core`
- 场景：`scenario.sealed_choir`

显示名可以中文或英文，但 ID 必须稳定、可引用、可搜索。

### 7.3 Demand Ticket Format for Engineering

如果主策划提出的新功能当前程序不支持，必须以需求工单形式提交，不得口头要求程序“做一个感觉”。

需求工单字段：

- `ticketId`
- `title`
- `requesterRole`
- `designGoal`
- `playerValue`
- `affectedSystems`
- `requiredState`
- `requiredDataFields`
- `triggerExamples`
- `expectedFeedback`
- `mvpPriority`
- `nonGoals`
- `acceptanceCriteria`
- `needsArchitectReview`

示例：

```text
ticketId: design.req.role.starting_knowledge
title: 支持玩家角色初始已知地图差异
requesterRole: 主策划
designGoal: 让不同角色开局信息不对称
playerValue: 测绘员开局能规划路线，开拓者需要冒险确认风险
affectedSystems: world seed, visibility, player role
requiredState: 每个角色可定义初始 known/visited nodeIds
requiredDataFields: roleId, knownNodeIds, visitedNodeIds
triggerExamples: 开始新场景时根据 roleId 初始化 visibility
expectedFeedback: debug UI 或角色摘要显示已知区域
mvpPriority: high
nonGoals: 不做完整成长树，不做动态侦察技能树
acceptanceCriteria: 同一 seed 不同角色初始可见节点不同，且事件日志解释开局信息来源
needsArchitectReview: yes
```

## 8. User or System Workflows

### 8.1 主策划到执行策划

主策划交付：

- 内容主题。
- 内容池规模。
- 字段模板。
- 风格边界。
- 禁止事项。
- 验收标准。

执行策划交回：

- 内容表。
- 示例条目。
- 触发条件。
- 数值范围。
- 玩家可见文本。
- 系统效果。
- QA 清单。

每批内容至少进行一次系统化检查和玩家感知检查。

### 8.2 主策划到架构师

需要架构师确认的内容：

- 新数据字段是否进入核心模型。
- 新系统是否符合 simulation-first。
- 新设计是否破坏模块边界。
- 哪些内容可先做表，哪些必须等系统支持。
- 当前 Phase 是否能承载该需求。

### 8.3 主策划到执行程序

主策划不直接交付模糊设定给程序员。交给程序前必须具备：

- 稳定 ID。
- 数据字段。
- 触发条件。
- 状态效果。
- 验收标准。
- 至少一个示例。
- 架构师确认记录。

### 8.4 玩家体验回路

MVP 玩家回路应保持：

1. 探索节点。
2. 发现资源、稳定性、派系或禁忌。
3. 理解至少一种风险。
4. 改变连接关系或选择等待。
5. 观察 tick 后果。
6. 读取事件解释。
7. 形成下一次判断。

## 9. Round Plan

Goal 1 建议 2 轮完成。

### Round 1：主策划认知对齐

目标：

- 建立核心体验定义、玩家幻想、设计支柱、MVP 验收标准和非目标。

影响文件：

- `docs/ROOTLINE_Lead_Design_Principles_CN.md`

交付物：

- 本文件。
- 主策划原则。
- MVP 体验验收标准。
- 工程需求工单格式。
- 下一 AI 交接 prompt。

验收标准：

- 文件存在于 `docs/`。
- 包含目标、非目标、角色路由、阶段轮次、自检标准、验收标准和下一 AI 交接 prompt。
- 原则能指导角色系统、派系、事件、任务和场景设计。
- 未引入未经架构师确认的新数据契约。

### Round 2：主策自检与架构对齐准备

目标：

- 审查本文件是否足够指导 Goal 2 角色系统。
- 标出角色系统可能需要架构师确认的数据需求。

建议影响文件：

- `docs/ROOTLINE_Lead_Design_Principles_CN.md`
- `docs/ROOTLINE_Player_Role_System_Design_CN.md`，如果用户要求继续进入 Goal 2。

交付物：

- 角色系统输入清单。
- 需要架构师确认的候选字段。
- 执行策划可用的角色设计模板。

验收标准：

- 明确哪些角色差异只需内容表，哪些需要程序支持。
- 每个候选新字段都有玩家价值和验收标准。
- 不开始大规模内容生产，直到角色模板稳定。

## 10. Round Self-Check Standards

主策划每轮必须检查：

### 10.1 目标检查

- 本轮目标是否完成。
- 是否偏离当前 Goal。
- 是否明确 MVP 与非 MVP。
- 是否产生本地文档或可交付内容表。

### 10.2 体验检查

- 玩家是否能感知该设计。
- 是否产生选择。
- 是否有代价、风险或后果。
- 是否服务“拓扑改变文明”。

### 10.3 系统化检查

- 是否有稳定 ID 或命名规则。
- 是否有触发条件。
- 是否有状态变化。
- 是否能交给执行策划或架构师继续推进。

### 10.4 内容丰富度检查

- 是否能扩展成内容池。
- 是否与角色、派系、事件、任务、区域产生交叉。
- 是否避免一次性剧情堆砌。

### 10.5 协议检查

- 是否符合 GDD、TDD、Project Plan。
- 是否符合 `docs/ROOTLINE_Design_Work_Roadmap_CN.md`。
- 是否需要架构师确认数据模型。
- 是否需要程序员提供技术能力支持。

## 11. Debug Standards

设计问题也需要调试，而不是靠感觉反复改。

调试流程：

1. 说清楚失败点：不好玩、不可读、不可实现、偏离拓扑、内容太散，或缺少验收。
2. 回到具体条目，检查字段、触发、状态变化和反馈。
3. 找最小修复：补字段、收缩范围、增加代价、改成状态目标，或降级到非 MVP。
4. 重新跑自检标准。
5. 如果需要程序能力，转成需求工单。

常见失败处理：

- Lore-only：补充触发条件和状态后果；补不了就移出 MVP。
- 角色差异弱：增加出生点、初始信息、行动、关系、目标中的至少 3 类差异。
- 派系像换皮：增加禁忌、偏好、资源需求和对同一拓扑变化的不同反应。
- 事件不可读：补充玩家可见文本和历史日志文本。
- 任务像脚本：改写为初始状态到目标状态的转化。

## 12. Architecture Review Standards

主策划在请求架构审查前必须先自查：

- 是否保持 simulation-first。
- 是否没有让 UI 成为世界事实来源。
- 是否没有绕过 `WorldSnapshot` 或未来核心数据模型。
- 是否没有要求 Phase 2 承担 Phase 5 以后系统。
- 是否能用字段、触发、状态变化和验收标准表达。
- 是否明确 MVP 优先级。
- 是否保留执行程序的实现自由度。

需要升级给架构师和用户确认的情况：

- 改变 MVP 核心循环。
- 新增完整对话树、装备成长、复杂经济系统等大系统。
- 改变玩家身份定义。
- 改变核心资源轴。
- 改变派系行为模型。
- 要求程序侧改变架构层级。
- 内容规模超出当前 Phase 预算。

## 13. Code and Content Quality Constraints

主策划和执行策划必须遵守：

- 不写只有氛围、不能实现的设定。
- 不把多个系统混成一个无法测试的特例。
- 不为单个剧情创建一次性规则。
- 不把角色差异压缩成简单数值加成。
- 不把任务写成固定脚本。
- 不把派系写成只有背景文本的阵营。
- 不用临时 ID 或会随文案变化的 ID。
- 不要求程序实现未经架构师确认的数据契约。
- 不为了内容丰富度牺牲模拟清晰度。

设计内容应优先做到：

- 字段清晰。
- 触发明确。
- 后果可见。
- 可被测试。
- 可扩展成内容池。
- 能映射到已有或已申请的系统能力。

## 14. Verification Commands or Review Methods

本文件的验证方式：

```sh
test -f docs/ROOTLINE_Lead_Design_Principles_CN.md
rg "^## " docs/ROOTLINE_Lead_Design_Principles_CN.md
git diff -- docs/ROOTLINE_Lead_Design_Principles_CN.md
```

文档内容验收：

- 是否包含 `Objective`。
- 是否包含 `Non-Goals`。
- 是否声明会话角色为 `主策划`。
- 是否包含核心体验定义。
- 是否包含玩家幻想。
- 是否包含设计支柱。
- 是否包含 MVP 体验验收标准。
- 是否包含轮次计划。
- 是否包含自检标准。
- 是否包含需求工单格式。
- 是否包含下一 AI 交接 prompt。

本阶段不要求运行 `npm run verify`，因为没有改动程序代码；如后续同轮修改代码或数据文件，则必须运行。

## 15. Risks and Open Questions

### 15.1 Risks

- 主策原则过宽，导致后续执行策划仍然产出 lore-only 内容。
- 角色系统过早要求程序支持复杂成长或技能树。
- 派系内容扩写过多，但行为模型尚未稳定。
- MVP 体验被战斗、对话或美术需求挤占。
- 事件库追求数量，但缺少系统触发和状态后果。

### 15.2 Open Questions

- 玩家在 MVP 中是物理存在的角色，还是介于测绘者和干预者之间的抽象角色？当前倾向：具备角色身份，但先通过开局、信息、行动和关系体现，不做完整扮演系统。
- 角色专属行动是否需要程序字段，还是先用任务/场景规则表达？需要 Goal 2 后交架构师确认。
- 派系关系是否在 Phase 2 后立即纳入核心模型，还是 Phase 4 再统一实现？需架构师按程序路线确认。
- 历史摘要在 MVP 中是事件日志聚合，还是独立系统？当前倾向：先从结构化事件日志派生。

## 16. Handoff Prompt for the Next AI

```text
Use $do-next-goal or $goal-next according to the user's request.

Session role:
主策划

Source of truth:
docs/ROOTLINE_Lead_Design_Principles_CN.md

Goal:
Continue ROOTLINE lead design work after Goal 1. The recommended next goal is
Goal 2: create docs/ROOTLINE_Player_Role_System_Design_CN.md.

Required reading:
- docs/ROOTLINE_Lead_Design_Principles_CN.md
- docs/ROOTLINE_Lead_Designer_Handoff_CN.md
- docs/ROOTLINE_Game_Design_Document.md
- docs/ROOTLINE_Technical_Design_Document.md
- docs/ROOTLINE_Project_Plan.md
- docs/ROOTLINE_Design_Work_Roadmap_CN.md
- docs/ROOTLINE_Phase_2_Architecture_Design_CN.md

Goal 2 expected output:
- PlayerRole schema draft.
- First 4 roles: 根脉测绘员, 地层工程师, 放逐调停者, 破壁开拓者.
- Starting location principles.
- Initial known map differences.
- Initial faction relation matrix.
- Special actions, restrictions, risks, personal goals, and opening hooks.
- MVP vs non-MVP boundary.
- Architecture review questions for fields that need program support.

Rules:
- Do not design full growth trees.
- Do not add program requirements without a demand ticket.
- Every role must differ in at least 3 of these 5 dimensions: starting point,
  initial information, available actions, faction relations, personal goal or
  ending evaluation.
- Every role must make topology choices feel different.
- End with self-check, acceptance criteria, and next AI handoff prompt.
```

## 17. Local Document Verification

本文件应保存为：

`docs/ROOTLINE_Lead_Design_Principles_CN.md`

本文件通过后，主策划 Goal 1 可视为完成；下一步建议进入 Goal 2：玩家角色系统方向文档。
