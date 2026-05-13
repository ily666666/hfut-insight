<script setup lang="ts">
import { computed, ref } from 'vue';

const activeTab = ref('updates');

const commonGuides = [
  { title: '认证机制', value: 'API Key', desc: '所有接口均采用 API Key 认证，在请求头中传入 Authorization。' },
  { title: '推荐协议', value: 'HTTPS', desc: '服务支持 HTTP 和 HTTPS，涉及业务数据时优先使用 HTTPS 调用。' },
  { title: '数据格式', value: 'JSON / UTF-8', desc: 'RequestBody 与 ResponseBody 均采用 JSON 结构和 UTF-8 编码。' },
];

const updateRows = [
  {
    id: 'api-update-20260113-video',
    date: '2026-01-13',
    api: '技能调用运行',
    change: '更新接口，新增视频类型参数。',
    impact: 'run 调用需要在入参 schema 中区分图片、视频和文件 URL，视频分析可复用视图分析素材。',
    status: '已纳入 API 调试器',
  },
  {
    id: 'api-update-20260113-metadata',
    date: '2026-01-13',
    api: '获取技能元数据',
    change: '新增接口，用于查询指定技能的输入输出参数结构定义。',
    impact: '调用方应先读取 metadata，再按 schema 组装 run 请求，避免参数结构漂移。',
    status: '已纳入 API 调试器',
  },
  {
    id: 'api-update-20260113-run',
    date: '2026-01-13',
    api: '技能调用运行',
    change: '新增接口，用于执行技能分析并返回结果。',
    impact: '技能发布 API 后可通过 run 同步提交分析输入，并获取结构化识别结果。',
    status: '已纳入 API 调试器',
  },
];

const requestStructureRows = [
  { type: 'HTTP Method', desc: 'HTTP 请求方法，用于声明正在请求的操作类型。', example: 'GET / POST' },
  { type: 'HEADER', desc: '通过 HTTP 头域传入请求信息。', example: 'host, Authorization' },
  { type: 'URI', desc: '用于指明操作实体。', example: 'GET /api/skills/v1/{ep-id}/metadata' },
  { type: 'Query 参数', desc: 'URL 中携带的请求参数，用于补充筛选、分页或动作。', example: '?page=1&pageSize=20' },
  { type: 'RequestBody', desc: '通过 JSON 格式组织的请求数据体。', example: '{ "inputs": [] }' },
];

const responseStructureRows = [
  { content: 'HTTP STATUS CODE', desc: '标准 HTTP 状态码，如 200、400、403、404 等。' },
  { content: 'ResponseBody', desc: '通过 JSON 格式组织的响应数据体，内容采用 UTF-8 编码。' },
];

const errorRows = [
  { code: '401', desc: '认证失败，API Key 无效或缺失。' },
  { code: '404', desc: '技能端点不存在。' },
  { code: '400', desc: '请求参数不合法。' },
  { code: '500', desc: '服务器内部错误。' },
];

const apiFlowSteps = [
  '获取 API Key',
  '查询技能元数据',
  '解析 inputs / outputs',
  '构建 schema value',
  '执行技能调用',
  '解析动态结果',
];

const apiRows = [
  { id: 'meta', name: '获取技能元数据', method: 'GET', endpoint: '/api/skills/v1/{ep-id}/metadata', desc: '查询技能输入输出参数结构定义，返回 inputs、outputs 与 schema。' },
  { id: 'run', name: '技能调用运行', method: 'POST', endpoint: '/api/skills/v1/{ep-id}/run', desc: '按 metadata schema 填入转义后的 JSON 字符串，执行技能并返回动态输出。' },
];

const metadataParamRows = [
  { field: 'ep-id', type: 'String', required: '是', position: 'URL 参数', desc: '技能的唯一标识，格式如 ep-public-example。' },
  { field: 'result.inputs', type: 'Array<InputParam>', required: '—', position: 'ResponseBody', desc: '输入参数定义列表。' },
  { field: 'result.outputs', type: 'Array<OutputParam>', required: '—', position: 'ResponseBody', desc: '输出参数定义列表。' },
  { field: 'schema', type: 'Array<SchemaField>', required: '—', position: 'ResponseBody', desc: '字段名、展示名、类型、值类型、默认值和可选状态。' },
];

const runParamRows = [
  { field: 'ep-id', type: 'String', required: '是', position: 'URL 参数', desc: '技能的唯一标识，格式如 ep-public-example。' },
  { field: 'inputs', type: 'Array<RunInput>', required: '是', position: 'RequestBody', desc: '输入参数列表，结构需与 metadata 返回的 inputs 对应。' },
  { field: 'schema[].name', type: 'String', required: '是', position: 'RequestBody', desc: '字段名，与元数据一致。' },
  { field: 'schema[].type', type: 'String', required: '是', position: 'RequestBody', desc: '字段类型，与元数据一致。' },
  { field: 'schema[].value', type: 'String', required: '是', position: 'RequestBody', desc: '实际业务值，必须是 JSON 字符串的转义形式。' },
];

const typeRows = [
  { type: '基础类型', examples: 'String、Integer、Boolean、Float、TemplateString', note: '按 metadata 中 type 或 valueType 判断。' },
  { type: '视觉类型', examples: 'Image、Video、Detection、TrackDetection、Attribute', note: '需传入完整 JSON 对象字符串。' },
  { type: '空间规则', examples: 'ROI、Tripwire、Target、Keypoint', note: '用于电子围栏、绊线、目标分类和关键点结果。' },
  { type: '识别结果', examples: 'OCR、Category、TopK Prediction、Visuals', note: '用于文本识别、分类、TopK 预测和可视化展示。' },
  { type: '数组类型', examples: 'Array<T>', note: '传入 JSON 数组字符串。' },
];

const faqRows = [
  { question: '如何确定某个字段的类型？', answer: '以 metadata 返回的 schema[].type 或 valueType 为准，前端调试表单应动态渲染。' },
  { question: '布尔值应该传入什么格式？', answer: '按字段类型传入 JSON 字符串中的布尔值，避免传成普通展示文本。' },
  { question: '数组类型如何传入？', answer: 'Array<T> 类型应传入 JSON 数组字符串，例如目标列表或多区域配置。' },
  { question: '时间字段应该使用什么格式？', answer: '时间字段按技能 schema 约定填入，视图素材可使用毫秒时间戳关联发生时间。' },
  { question: '如何获取 API Key？', answer: '登录慧眼智能云控制台，在对应服务中获取 API Key。' },
  { question: '如何让多模态大模型输出目标检测框？', answer: '在技能输出 schema 中配置视觉类型结果，并在 run 结果中读取对应的 Detection/Visuals 字段。' },
];

const sampleRows = [
  { scene: '图片输入', field: 'image', valueType: 'Image', value: '{"imageData":"+q5dukt+A","imageDataType":"base64","imageId":"123456","sourceId":"dev2","imageWidth":"640","imageHeight":"428","timestamp":"1762498237615"}' },
  { scene: '视频输入', field: 'video', valueType: 'Video', value: '{"videoData":"http://xxx/xxx.mp4","videoDataType":"url","videoId":"123456","videoWidth":"640","videoHeight":"428"}' },
];

const skillErrorRows = [
  { code: 'BadRequest', status: '400', desc: '请求参数不合法，检查请求体格式。' },
  { code: 'Unauthorized', status: '401', desc: 'API Key 无效或缺失。' },
  { code: 'NotFound', status: '404', desc: '指定的技能端点不存在。' },
  { code: 'InternalServerError', status: '500', desc: '服务器内部错误，稍后重试。' },
];

const codeSamples = {
  metadata: 'curl -X GET "https://yijian-next.cloud.baidu.com/api/skills/v1/ep-xxxxx/metadata" \\\n  -H "Authorization: Bearer {您的API Key}"',
  run: 'curl -X POST "https://yijian-next.cloud.baidu.com/api/skills/v1/ep-public-example/run" \\\n  -H "Authorization: Bearer {您的API Key}" \\\n  -H "Content-Type: application/json" \\\n  -d \'{"inputs":[{"name":"input0","type":"DataSet","schema":[{"name":"image","type":"Image","value":"{\\\"imageData\\\":\\\"+q5dukt+A\\\",\\\"imageDataType\\\":\\\"base64\\\"}"}]}]}\'',
};


const summaryCards = computed(() => [
  { title: '更新日期', value: '2026-01-13', desc: 'API 参考当前记录集中在技能 metadata 与 run 调用能力。' },
  { title: '新增接口', value: '02', desc: '新增获取技能元数据接口和技能调用运行接口。' },
  { title: '参数更新', value: '视频类型', desc: '技能调用运行接口新增视频类型参数，支持图片/视频分析场景。' },
]);

const updateColumns = [
  { title: '发布时间', dataIndex: 'date', key: 'date', width: 130 },
  { title: '接口', dataIndex: 'api', key: 'api', width: 160 },
  { title: '更新介绍', dataIndex: 'change', key: 'change', width: 280 },
  { title: '项目落点', dataIndex: 'impact', key: 'impact' },
  { title: '状态', dataIndex: 'status', key: 'status', width: 150 },
];

const requestColumns = [
  { title: '参数类型', dataIndex: 'type', key: 'type', width: 160 },
  { title: '说明', dataIndex: 'desc', key: 'desc' },
  { title: '示例', dataIndex: 'example', key: 'example', width: 300 },
];

const responseColumns = [
  { title: '响应内容', dataIndex: 'content', key: 'content', width: 180 },
  { title: '说明', dataIndex: 'desc', key: 'desc' },
];

const errorColumns = [
  { title: '错误码', dataIndex: 'code', key: 'code', width: 120 },
  { title: '说明', dataIndex: 'desc', key: 'desc' },
];

const paramColumns = [
  { title: '参数名称', dataIndex: 'field', key: 'field', width: 190 },
  { title: '类型', dataIndex: 'type', key: 'type', width: 170 },
  { title: '必选', dataIndex: 'required', key: 'required', width: 90 },
  { title: '位置', dataIndex: 'position', key: 'position', width: 130 },
  { title: '说明', dataIndex: 'desc', key: 'desc' },
];

const typeColumns = [
  { title: '类型分组', dataIndex: 'type', key: 'type', width: 140 },
  { title: '示例类型', dataIndex: 'examples', key: 'examples', width: 360 },
  { title: '传入规则', dataIndex: 'note', key: 'note' },
];

const sampleColumns = [
  { title: '场景', dataIndex: 'scene', key: 'scene', width: 110 },
  { title: '字段', dataIndex: 'field', key: 'field', width: 100 },
  { title: '值类型', dataIndex: 'valueType', key: 'valueType', width: 120 },
  { title: 'value 示例', dataIndex: 'value', key: 'value', ellipsis: true },
];

const skillErrorColumns = [
  { title: '错误码', dataIndex: 'code', key: 'code', width: 180 },
  { title: 'HTTP状态码', dataIndex: 'status', key: 'status', width: 120 },
  { title: '中文解释', dataIndex: 'desc', key: 'desc' },
];

const apiColumns = [
  { title: '接口名称', dataIndex: 'name', key: 'name', width: 180 },
  { title: '方法', dataIndex: 'method', key: 'method', width: 100 },
  { title: 'Endpoint', dataIndex: 'endpoint', key: 'endpoint', width: 280 },
  { title: '说明', dataIndex: 'desc', key: 'desc' },
];
</script>

<template>
  <div class="official-page api-reference-page">
    <section class="official-card hero-card">
      <div>
        <h1 class="official-page-title">API参考</h1>
        <p>集中承载识界 API 功能更新、通用调用说明和技能相关接口，优先服务技能发布 API 后的接入调试。</p>
      </div>
      <div class="official-toolbar">
        <a-button>导出更新记录</a-button>
        <a-button type="primary">打开 API 调试器</a-button>
      </div>
    </section>

    <section class="stats-grid">
      <article v-for="item in summaryCards" :key="item.title" class="official-metric">
        <div>
          <div class="official-metric-value">{{ item.value }}</div>
          <div class="official-metric-label">{{ item.title }}</div>
          <p>{{ item.desc }}</p>
        </div>
      </article>
    </section>

    <section class="official-card page-card">
      <a-tabs v-model:active-key="activeTab">
        <a-tab-pane key="updates" tab="API功能更新记录" />
        <a-tab-pane key="common" tab="通用说明" />
        <a-tab-pane key="skill" tab="技能相关接口" />
      </a-tabs>

      <div v-if="activeTab === 'updates'" class="tab-panel">
        <div class="section-head">
          <div>
            <h2>API功能更新</h2>
            <p>对齐在线文档 2026-04-21 版本：2026-01-13 新增 metadata、run 接口，并为 run 增加视频类型参数。</p>
          </div>
          <a-tag color="blue">正文无业务示意图，在线页仅含公共导航图标</a-tag>
        </div>
        <a-table :columns="updateColumns" :data-source="updateRows" row-key="id" :pagination="false">
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'status'">
              <a-tag color="green">{{ record.status }}</a-tag>
            </template>
          </template>
        </a-table>
      </div>

      <div v-else-if="activeTab === 'common'" class="tab-panel common-panel">
        <div class="section-head">
          <div>
            <h2>通用说明</h2>
            <p>对齐在线文档 2026-04-21 版本：所有接口采用 API Key 认证，服务端点为 yijian-next.cloud.baidu.com。</p>
          </div>
          <a-tag color="blue">正文无业务示意图，在线页仅含公共导航图标</a-tag>
        </div>

        <section class="common-grid">
          <article v-for="item in commonGuides" :key="item.title" class="common-card">
            <span>{{ item.title }}</span>
            <strong>{{ item.value }}</strong>
            <p>{{ item.desc }}</p>
          </article>
        </section>

        <a-descriptions class="endpoint-card" bordered size="small" :column="1">
          <a-descriptions-item label="请求头">Authorization: Bearer {'{您的API Key}'}</a-descriptions-item>
          <a-descriptions-item label="API Key 来源">在慧眼智能云控制台获取，前缀为 bce-v3/。</a-descriptions-item>
          <a-descriptions-item label="通信协议">支持 HTTP 和 HTTPS，建议使用 HTTPS。</a-descriptions-item>
          <a-descriptions-item label="服务域名">yijian-next.cloud.baidu.com</a-descriptions-item>
          <a-descriptions-item label="协议">HTTP and HTTPS</a-descriptions-item>
        </a-descriptions>

        <div class="table-stack">
          <section>
            <h3>请求结构说明</h3>
            <a-table :columns="requestColumns" :data-source="requestStructureRows" row-key="type" :pagination="false" />
          </section>
          <section>
            <h3>响应结构说明</h3>
            <a-table :columns="responseColumns" :data-source="responseStructureRows" row-key="content" :pagination="false" />
          </section>
          <section>
            <h3>错误码</h3>
            <a-table :columns="errorColumns" :data-source="errorRows" row-key="code" :pagination="false" />
          </section>
        </div>
      </div>

      <div v-else class="tab-panel skill-panel">
        <div class="section-head">
          <div>
            <h2>技能相关接口</h2>
            <p>对齐在线文档 2026-04-21 版本：先获取 metadata，再按 schema 将 value 填为 JSON 字符串转义形式并调用 run。</p>
          </div>
          <a-tag color="purple">8 张图片，其中 4 张为 metadata/run 与数据类型业务示意图</a-tag>
        </div>

        <a-steps class="api-flow" :current="5" size="small">
          <a-step v-for="step in apiFlowSteps" :key="step" :title="step" />
        </a-steps>

        <div class="table-stack">
          <section>
            <h3>接口列表</h3>
            <a-table :columns="apiColumns" :data-source="apiRows" row-key="id" :pagination="false" />
          </section>

          <section class="code-card">
            <h3>获取技能元数据</h3>
            <p>用于获取指定技能端点的输入输出参数结构定义，动态构建正确调用请求。</p>
            <pre>{{ codeSamples.metadata }}</pre>
            <a-table :columns="paramColumns" :data-source="metadataParamRows" row-key="field" :pagination="false" />
          </section>

          <section class="code-card">
            <h3>技能调用运行</h3>
            <p>调用前必须先读取 metadata；必填字段都要有值，传入类型必须与 type 或 valueType 匹配。</p>
            <pre>{{ codeSamples.run }}</pre>
            <a-alert show-icon type="warning" message="schema[].value 必须是 JSON 字符串的转义形式；Array<T> 传 JSON 数组字符串，Image/Video 等视觉类型传完整 JSON 对象字符串。" />
            <a-table :columns="paramColumns" :data-source="runParamRows" row-key="field" :pagination="false" />
          </section>

          <section>
            <h3>图片 / 视频输入 value 示例</h3>
            <a-table :columns="sampleColumns" :data-source="sampleRows" row-key="scene" :pagination="false" />
          </section>

          <section>
            <h3>数据类型</h3>
            <a-table :columns="typeColumns" :data-source="typeRows" row-key="type" :pagination="false" />
          </section>

          <section>
            <h3>接口错误码</h3>
            <a-table :columns="skillErrorColumns" :data-source="skillErrorRows" row-key="code" :pagination="false" />
          </section>

          <section>
            <h3>常见问题</h3>
            <a-collapse ghost>
              <a-collapse-panel v-for="item in faqRows" :key="item.question" :header="item.question">
                <p>{{ item.answer }}</p>
              </a-collapse-panel>
            </a-collapse>
          </section>
        </div>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.api-reference-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hero-card,
.page-card {
  padding: 16px;
}

.hero-card {
  display: flex;
  justify-content: space-between;
  gap: 16px;

  p {
    margin: 8px 0 0;
    color: $text-secondary;
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;

  p {
    margin: 4px 0 0;
    color: #7a86a1;
    font-size: 12px;
    line-height: 1.6;
  }
}

.tab-panel {
  margin-top: 8px;
}

.section-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;

  h2 {
    margin: 0 0 4px;
    color: $text-primary;
    font-size: 16px;
  }

  p {
    margin: 0;
    color: $text-secondary;
    line-height: 1.6;
  }
}

.common-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 16px;
}

.common-card {
  padding: 16px;
  border: 1px solid $divider;
  border-radius: 12px;
  background: #fbfdff;

  span {
    color: $text-secondary;
    font-size: 12px;
  }

  strong {
    display: block;
    margin-top: 6px;
    color: $text-primary;
    font-size: 20px;
  }

  p {
    margin: 8px 0 0;
    color: #7a86a1;
    line-height: 1.6;
  }
}

.api-flow {
  margin-bottom: 18px;
}

.code-card {
  p {
    margin: 0 0 10px;
    color: $text-secondary;
    line-height: 1.6;
  }

  pre {
    margin: 0 0 12px;
    padding: 12px;
    overflow-x: auto;
    border-radius: 10px;
    background: #0f172a;
    color: #dbeafe;
    font-size: 12px;
    line-height: 1.6;
  }

  :deep(.ant-alert) {
    margin-bottom: 12px;
  }
}

.table-stack {
  display: flex;
  flex-direction: column;
  gap: 18px;

  h3 {
    margin: 0 0 10px;
    color: $text-primary;
    font-size: 15px;
  }
}

.muted-panel {
  min-height: 180px;
  padding: 24px;
  border: 1px dashed $divider;
  border-radius: 12px;
  background: #fbfdff;

  h2 {
    margin: 0 0 8px;
    color: $text-primary;
  }

  p {
    margin: 0;
    color: $text-secondary;
  }
}

@media (max-width: 1080px) {
  .hero-card,
  .section-head {
    flex-direction: column;
  }

  .stats-grid,
  .common-grid {
    grid-template-columns: 1fr;
  }
}
</style>
