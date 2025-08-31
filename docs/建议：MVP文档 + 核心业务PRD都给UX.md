建议：MVP文档 + 核心业务PRD都给UX

  🎯 UX设计师需要的信息层次

  必须给UX看的文档：

  1. MVP_User_Personas.md 📋 必需
    - 直接的设计依据：李明和Sarah的用户画像
  2. core-business-prd-v7.md 📋 必需
    - 为什么需要：UX需要理解完整的业务逻辑和用户旅程
    - 具体价值：7层课程体系、付费转化流程、学习体验设计

  可选给UX看的文档：

  3. MVP_API_Contract.md 📋 可选
    - 帮助UX理解数据结构和界面可能性
  4. MVP_System_Architecture.md ❌ 不需要
    - 纯技术文档，UX用不到
  5. MVP_Security_Baseline.md ❌ 不需要
    - 对UX设计影响很小

  ---
  🎨 UX设计师的工作流程

  graph TD
      A[MVP_User_Personas] --> B[理解目标用户]
      C[core-business-prd-v7] --> D[理解业务流程]
      B --> E[设计用户旅程]
      D --> E
      E --> F[界面原型设计]
      F --> G[交互细节设计]

  ---
  💡 具体给UX的建议

  第一次对接时说：

  "这里有两个关键文档：

  1. MVP_User_Personas.md - 我们的核心用户画像，设计时请重点考虑李明和Sarah的需求
  2. core-business-prd-v7.md - 完整的业务功能描述，但我们MVP阶段只做前3层课程体系

  MVP_API_Contract.md可以参考，了解数据结构。其他PRD文档是背景信息，暂时不用深入看。"

  UX关注的核心问题：

  - ✅ 用户是谁？→ MVP_User_Personas
  - ✅ 用户要做什么？→ core-business-prd-v7
  - ✅ MVP简化了什么？→ 明确告知简化策略
  - ❓ 数据从哪来？→ MVP_API_Contract（可选）

  ---
  📋 推荐的UX对接材料包

  给UX的文档包/
  ├── 📋 MVP_User_Personas.md          # 核心用户画像
  ├── 📋 core-business-prd-v7.md       # 业务功能全景
  ├── 📋 MVP_API_Contract.md           # 数据接口参考
  └── 📝 UX设计简报.md                 # 你需要补充的

  建议创建一个UX设计简报：

  - MVP功能简化对照表
  - 设计优先级指导
  - 技术约束说明（比如使用Bootstrap 5.3.6）

  ---
  🎯 总结

  给UX看：MVP文档 + core-business-prd-v7.md

  这样UX既能理解完整业务逻辑（避免设计偏离），又能专注于MVP简化版本的具体实现