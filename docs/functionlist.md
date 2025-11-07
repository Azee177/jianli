继续为您列出需要实现的功能：

[1 tool called]

## 🔧 需要完善和新增的功能清单

### 一、上传与解析阶段 (Upload & OCR)

#### **后端需要新增：**

1. **照片提取服务** `apps/api/app/services/photo_service.py`
   ```python
   - extract_photo_from_pdf(pdf_bytes) → 提取用户照片
   - save_photo_to_storage(photo_bytes, user_id) → 保存到对象存储
   - apply_photo_to_template(template_id, photo_url) → 将照片应用到模板
   ```

2. **增强OCR服务** `apps/api/app/ocr.py`
   ```python
   - extract_photo_regions(pdf_bytes) → 识别照片区域
   - extract_contact_info(text) → 增强联系方式提取
   - extract_education_info(text) → 教育背景提取
   - extract_work_experience(text) → 工作经历结构化提取
   ```

#### **前端需要新增：**

3. **照片预览组件** `apps/web/src/components/upload/PhotoPreview.tsx`
   - 显示提取的照片
   - 支持重新上传/裁剪照片
   - 预览照片在模板中的效果

---

### 二、智能对话式岗位推荐 (Intent Collection)

#### **后端需要新增：**

4. **岗位推荐服务** `apps/api/app/services/job_recommendation_service.py`
   ```python
   - analyze_resume_background(resume_id) → 分析用户背景
   - recommend_positions(resume_analysis, user_preferences) → LLM推荐岗位
   - fetch_job_suggestions(position, company, city) → 获取5-8条候选岗位
   - confirm_single_target(job_id, user_id) → 确认唯一目标岗位
   ```

5. **对话式引导服务** `apps/api/app/services/conversation_service.py`
   ```python
   - start_intent_session(resume_id) → 开始对话会话
   - ask_followup_questions(session_id, context) → LLM生成引导问题
   - parse_user_response(response, context) → 解析用户回答
   - generate_job_cards(intent_data) → 生成岗位卡片
   ```

6. **路由接口** `apps/api/app/routes/intent.py`
   ```python
   - POST /intent/start → 开始意图收集
   - POST /intent/chat → 对话交互
   - GET /intent/suggestions → 获取岗位建议
   - POST /intent/confirm → 确认唯一目标岗位
   - POST /intent/reselect → 重新选择（清空下游数据）
   ```

#### **前端需要新增：**

7. **智能对话组件** `apps/web/src/components/intent/SmartConversation.tsx`
   - ChatGPT深度研究模式风格的对话界面
   - 流式打字效果
   - 引导性问题卡片
   - 岗位方向、公司、城市、级别等信息收集

8. **岗位推荐卡片** `apps/web/src/components/intent/JobRecommendationCard.tsx`
   - 显示5-8条推荐岗位
   - 岗位详情展开/对比
   - 唯一确认按钮
   - 重新选择警告弹窗

---

### 三、JD聚合分析与共性提取 (JD Analysis)

#### **后端需要增强：**

9. **多源JD抓取增强** `apps/api/app/services/jd_aggregation_service.py`
   ```python
   - fetch_multiple_jds(position, company, limit=15) → 抓取15条相同岗位JD
   - prioritize_target_company(jds, target_company) → 优先目标公司
   - fetch_from_official_sites(company, position) → 从大厂官网抓取
     * 字节跳动: jobs.bytedance.com
     * 腾讯: careers.tencent.com
     * 阿里巴巴: talent.alibaba.com
     * 百度: talent.baidu.com
   - parse_jd_details(jd_html) → 解析JD详情
   ```

10. **共性分析增强** `apps/api/app/services/commonality_service.py`
    ```python
    - analyze_15_jds(jd_list) → 分析15条JD
    - extract_atomic_requirements(jds) → 提取原子能力点
    - cluster_to_commonalities(requirements) → 聚合为4-5条共性
    - generate_editable_dimensions(commonalities) → 生成可编辑维度
    - validate_user_modifications(modified_dims) → 验证用户修改
    - lock_dimensions(common_dims_id) → 锁定共性维度
    ```

#### **前端需要增强：**

11. **JD聚合面板增强** `apps/web/src/components/panels/JDPanel.tsx`
    - 显示已抓取的15条JD列表
    - JD来源标识（目标公司高亮）
    - JD对比视图
    - 共性维度编辑器（支持修改/合并/拆分）
    - 锁定/解锁状态管理

12. **共性维度编辑器** `apps/web/src/components/jd/CommonalityEditor.tsx`
    - 复选框列表（4-5条）
    - 每条支持内联编辑
    - 显示原始JD证据句
    - 锁定确认对话框

---

### 四、简历优化与公司定制 (Resume Optimization)

#### **后端需要新增：**

13. **简历对齐服务** `apps/api/app/services/resume_alignment_service.py`
    ```python
    - generate_draft_v1(resume_id, common_dims) → 生成首轮草稿
    - analyze_gap(resume_content, common_dims) → 差距分析
    - suggest_improvements(gap_analysis) → 生成改进建议
    - rewrite_section(section, style, target) → 重写特定段落
    - apply_star_method(experience) → 应用STAR法则
    - add_quantification(text) → 添加量化指标
    ```

14. **公司定制服务** `apps/api/app/services/company_customization_service.py`
    ```python
    - fetch_company_culture(company_name) → 抓取公司文化
    - analyze_company_tone(company_materials) → 分析公司调性
    - generate_company_quarter(resume, jd, company_culture) → 生成1/4定制区
    - generate_value_alignment(user_exp, company_values) → 价值观呼应
    - generate_30_60_90_plan(role, company) → 生成入职计划
    ```

15. **选区优化服务** `apps/api/app/services/selection_optimization_service.py`
    ```python
    - optimize_selection(text, optimization_type) → 优化选中文本
      * 类型：STAR化、量化、降重、翻译、公司风格
    - generate_three_versions(text, style) → 生成稳健/优化/激进三版本
    - validate_factuality(original, optimized) → 防虚构校验
    - diff_and_highlight(old, new) → 生成diff和高亮
    ```

16. **路由接口** `apps/api/app/routes/optimize.py` (增强)
    ```python
    - POST /resumes/{id}/draft-v1 → 生成首轮草稿
    - POST /resumes/{id}/gap-analysis → 差距分析
    - POST /resumes/{id}/optimize-selection → 选区优化
    - POST /resumes/{id}/company-quarter → 公司定制区
    - GET /resumes/{id}/versions → 获取版本历史
    - POST /resumes/{id}/rollback → 版本回滚
    ```

#### **前端需要新增：**

17. **Diff编辑器增强** `apps/web/src/components/editor/DiffViewer.tsx`
    - Monaco Diff Editor集成
    - 新增内容绿色高亮
    - 删除内容灰色标注
    - 量化指标加粗显示
    - 侧边改进建议面板

18. **选区优化工具栏** `apps/web/src/components/editor/SelectionOptimizationToolbar.tsx`
    - STAR化按钮
    - 量化按钮
    - 降重按钮
    - 公司风格包选择器
    - 三版本对比弹窗

19. **公司定制区编辑器** `apps/web/src/components/company/CompanyQuarterEditor.tsx`
    - 1/4区占位提示
    - 价值观呼应生成器
    - 场景匹配建议
    - KPI语言镜像
    - 30/60/90天计划生成

20. **版本管理面板** `apps/web/src/components/resume/VersionHistory.tsx`
    - 版本列表展示
    - 版本对比
    - 一键回滚
    - 版本标注

---

### 五、学习准备与面试模拟 (Prep & Interview)

#### **后端需要增强：**

21. **学习准备服务增强** `apps/api/app/services/prep_service.py`
    ```python
    - extract_knowledge_points(common_dims, resume) → 提取知识点
    - search_bilibili_courses(keywords) → 搜索B站课程
    - fetch_official_docs(tech_stack) → 获取官方文档链接
    - generate_llm_summary(topic) → LLM生成学习摘要
    - create_practice_questions(topic) → 生成验证题
    - track_learning_progress(user_id, prep_kit_id) → 学习进度追踪
    ```

22. **面试模拟服务增强** `apps/api/app/services/interview_service.py`
    ```python
    - generate_interview_tree(resume, common_dims) → 生成面试问题树
    - generate_questions_by_level(experience, level) → 按难度生成问题
      * 基础/进阶/挑战
    - generate_behavioral_questions(company_culture) → 行为面试题
    - generate_answer_outline(question, resume_context) → 生成答案提纲
    - simulate_interviewer_followup(answer) → 模拟追问
    ```

23. **路由接口增强**
    ```python
    - POST /prep/generate → 生成准备清单（增强）
    - POST /prep/search-resources → 搜索学习资源
    - POST /prep/track-progress → 追踪学习进度
    - POST /interview/generate-tree → 生成面试问题树
    - POST /interview/simulate → 模拟面试对话
    - POST /interview/answer-feedback → 答案反馈
    ```

#### **前端需要增强：**

24. **学习准备清单增强** `apps/web/src/components/prep/PrepPanel.tsx`
    - 知识点卡片（显示来源：共性/简历）
    - B站课程链接嵌入
    - 官方文档链接
    - LLM摘要展开/折叠
    - 验证题练习
    - 进度追踪复选框

25. **面试模拟器** `apps/web/src/components/interview/InterviewSimulator.tsx`
    - 问题树结构展示
    - 基础/进阶/挑战标签
    - 答案输入框
    - AI反馈和追问
    - 笔记记录功能
    - 答案保存到简历备注

---

### 六、导出与投递追踪 (Export & Submission)

#### **后端需要新增：**

26. **投递追踪服务** `apps/api/app/services/submission_service.py`
    ```python
    - create_submission_record(resume_id, job_id, user_id) → 创建投递记录
    - get_official_application_link(company, position) → 获取官网投递链接
    - track_submission_status(submission_id) → 追踪投递状态
    - set_update_reminder(submission_id, remind_date) → 设置更新提醒
    - get_submission_board(user_id) → 获取投递看板
    ```

27. **更新提醒服务** `apps/api/app/services/reminder_service.py`
    ```python
    - create_reminder(user_id, submission_id, remind_date) → 创建提醒
    - send_reminder_notification(reminder_id) → 发送提醒通知
    - generate_resume_update_tips() → 生成简历更新建议
    ```

28. **路由接口** `apps/api/app/routes/submission.py`
    ```python
    - POST /submissions/create → 创建投递记录
    - GET /submissions/board → 获取投递看板
    - GET /submissions/official-link → 获取官网链接
    - POST /submissions/reminder → 设置提醒
    - GET /submissions/stats → 投递统计
    ```

#### **前端需要新增：**

29. **投递看板** `apps/web/src/components/submission/SubmissionBoard.tsx`
    - 投递记录列表
    - 岗位信息卡片
    - 投递时间线
    - 简历版本追踪
    - 状态更新（已投递/已查看/面试中/已拒绝等）
    - 官网链接快捷入口

30. **更新提醒面板** `apps/web/src/components/submission/ReminderPanel.tsx`
    - 提醒列表
    - 提醒时间设置
    - 更新建议提示
    - 一键跳转到官网

31. **官网投递助手** `apps/web/src/components/submission/OfficialSubmissionHelper.tsx`
    - 大厂官网链接收集
    - 投递指引
    - 表单填写提示

---

### 七、聊天界面优化 (Chat Enhancement)

#### **后端需要新增：**

32. **选区联动服务** `apps/api/app/routes/ws.py` (WebSocket增强)
    ```python
    - handle_selection_context(selection_text, resume_context) → 处理选区上下文
    - stream_optimization_response(text, optimization_type) → 流式返回优化结果
    ```

#### **前端需要增强：**

33. **智能聊天界面增强** `apps/web/src/components/chat/SmartChatInterface.tsx`
    - 选区内容自动注入对话
    - 上下文感知（当前编辑位置、优化阶段）
    - 快速操作按钮（应用建议/拒绝/再试一次）
    - 代码块样式显示优化建议
    - 流式打字效果
    - 历史对话记录

34. **选区与对话联动** `apps/web/src/hooks/useSelectionChat.ts`
    - 监听编辑器选区变化
    - 自动填充对话输入框
    - 应用优化结果到编辑器
    - 保存对话历史与选区映射

---

### 八、状态管理与流程控制 (State Management)

#### **前端需要新增：**

35. **状态机实现** `apps/web/src/machines/journeyMachine.ts` (XState)
    ```typescript
    - 状态定义：UPLOAD → PARSE_OK → INTENT_COLLECTING → 
      TARGET_CONFIRMED → JD_FETCHED → COMMON_DIMS_LOCKED → 
      DRAFT_V1 → REWRITE_LOOP → COMPANY_QUARTER_DONE → 
      PREP_READY → INTERVIEW_READY → EXPORTABLE → SUBMISSION_TRACKING
    - 状态转换守卫
    - 重新选择目标清空下游数据逻辑
    ```

36. **进度指示器增强** `apps/web/src/components/layout/ProgressIndicator.tsx`
    - 状态机驱动的进度显示
    - 当前阶段高亮
    - 可点击跳转（已完成阶段）
    - 锁定状态提示

---

### 九、数据存储与API集成

#### **后端需要新增：**

37. **数据库Schema扩展** `prisma/schema.prisma`
    ```prisma
    - Journey 模型（用户旅程）
    - TargetRole 模型（目标岗位）
    - CommonDimensions 模型（共性维度）
    - ResumeVersion 模型（简历版本）
    - SubmissionRecord 模型（投递记录）
    - Reminder 模型（提醒）
    - ConversationHistory 模型（对话历史）
    ```

38. **缓存策略** `apps/api/app/cache.py`
    ```python
    - cache_jd_results(jd_list) → 缓存JD结果
    - cache_company_culture(company) → 缓存公司文化数据
    - cache_user_session(session_id) → 缓存用户会话
    ```

---

### 十、LLM提示词管理

#### **后端需要新增：**

39. **提示词模板库** `apps/api/app/prompts/`
    ```
    - intent_collection.txt → 意图收集对话提示词
    - jd_commonality_extraction.txt → JD共性提取
    - resume_draft_v1.txt → 首轮草稿生成
    - selection_optimization.txt → 选区优化
    - company_quarter.txt → 公司定制区
    - prep_kit_generation.txt → 准备清单生成
    - interview_tree_generation.txt → 面试问题树
    ```

40. **提示词管理服务** `apps/api/app/services/prompt_service.py`
    ```python
    - load_prompt_template(template_name) → 加载模板
    - render_prompt(template, context) → 渲染提示词
    - version_control(template_name) → 版本控制
    ```

---

### 十一、测试与文档

41. **E2E测试** `apps/web/e2e/`
    - 完整流程测试（上传到导出）
    - 关键功能测试

42. **API文档完善**
    - OpenAPI规范更新
    - 接口示例补充

---

## 🎯 优先级建议

### P0 (必须实现 - 核心流程)
1. ✅ 照片提取和模板集成
2. ✅ 智能对话式岗位推荐
3. ✅ 15条JD聚合分析和共性提取
4. ✅ 简历对齐和首轮草稿生成
5. ✅ 选区优化功能

### P1 (重要 - 差异化功能)
6. 公司定制1/4区块生成
7. 学习准备清单增强（B站课程链接）
8. 面试模拟器
9. 官网投递链接和看板

### P2 (优化体验)
10. 版本管理和回滚
11. 流式对话效果
12. 进度追踪和提醒

---

需要我帮您开始实现某个具体功能吗？我可以从最优先的功能开始，比如**照片提取服务**或**智能对话推荐系统**。