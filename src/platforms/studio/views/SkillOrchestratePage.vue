<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import type { Connection } from '@vue-flow/core';
import { Handle, Position, VueFlow, useVueFlow } from '@vue-flow/core';
import { Background } from '@vue-flow/background';
import { Controls } from '@vue-flow/controls';
import { MiniMap } from '@vue-flow/minimap';
import { Icon } from '@iconify/vue';
import { message } from 'ant-design-vue';
import '@vue-flow/core/dist/style.css';
import '@vue-flow/core/dist/theme-default.css';
import '@vue-flow/controls/dist/style.css';
import '@vue-flow/minimap/dist/style.css';
import {
  INITIAL_ORCHESTRATE_EDGES,
  INITIAL_ORCHESTRATE_NODES,
  ORCHESTRATE_NODE_PALETTE,
  ORCHESTRATE_STATS,
  createNodeData,
} from '@/platforms/studio/constants/orchestrate-flow';
import type {
  OrchestrateNodeData,
  OrchestrateNodeKind,
  OrchestratePortSchema,
} from '@/platforms/studio/types/orchestrate-flow';

interface SkillFlowNode {
  id: string;
  type: 'skillNode';
  position: { x: number; y: number };
  data: OrchestrateNodeData;
}

interface SkillFlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
  label?: string;
  animated?: boolean;
}

const nodes = ref<SkillFlowNode[]>(INITIAL_ORCHESTRATE_NODES.map((item) => ({ ...item })));
const edges = ref<SkillFlowEdge[]>(INITIAL_ORCHESTRATE_EDGES.map((item) => ({ ...item })));
const selectedNodeId = ref('vision-1');
const activeCategory = ref('全部节点');
const validationErrors = ref<string[]>([]);
const publishOpen = ref(false);
const publishTarget = ref('发布技能');
const publishForm = reactive({
  version: '0.0.1',
  description: '',
  publishToVision: true,
  publishAsApi: true,
});
const skillMeta = reactive({
  name: '叉车运行非作业人员闯入',
  version: '草稿 V1.0.0',
  status: '草稿',
});
const { fitView, removeNodes, removeEdges } = useVueFlow();

const categories = computed(() => ['全部节点', ...new Set(ORCHESTRATE_NODE_PALETTE.map((item) => item.category))]);
const palette = computed(() => {
  if (activeCategory.value === '全部节点') return ORCHESTRATE_NODE_PALETTE;
  return ORCHESTRATE_NODE_PALETTE.filter((item) => item.category === activeCategory.value);
});
const selectedNode = computed<SkillFlowNode | null>(() => nodes.value.find((item) => item.id === selectedNodeId.value) || null);
const selectedNodeData = computed(() => selectedNode.value?.data || null);
const upstreamRefs = computed(() => {
  const refs: Array<{ label: string; value: string; dataType: string }> = [];
  nodes.value.forEach((node) => {
    node.data.outputs.forEach((port) => {
      refs.push({
        label: `${node.data.title}.${port.label}`,
        value: `${node.id}.${port.key}`,
        dataType: port.dataType,
      });
    });
  });
  return refs;
});

function addNode(kind: OrchestrateNodeKind) {
  const offset = nodes.value.length * 34;
  const id = `${kind}-${Date.now()}`;
  nodes.value.push({
    id,
    type: 'skillNode',
    position: { x: 160 + offset, y: 140 + offset / 3 },
    data: createNodeData(kind),
  });
  selectedNodeId.value = id;
}

function onConnect(connection: Connection) {
  if (connection.source === connection.target) {
    message.warning('节点不能连接到自身。');
    return;
  }
  edges.value = [
    ...edges.value,
    {
      id: `edge-${connection.source}-${connection.target}-${Date.now()}`,
      source: connection.source,
      target: connection.target,
      sourceHandle: connection.sourceHandle,
      targetHandle: connection.targetHandle,
      animated: true,
    },
  ];
}

function deleteSelection() {
  if (!selectedNode.value) return;
  removeNodes([selectedNode.value.id]);
  selectedNodeId.value = nodes.value[0]?.id || '';
}

function clearEdges() {
  removeEdges(edges.value.map((item) => item.id));
}

function updateParam(key: string, value: string | number | boolean) {
  const data = selectedNodeData.value;
  if (!data) return;
  data.params[key] = value;
}

function updateTitle(value: string) {
  const data = selectedNodeData.value;
  if (!data) return;
  data.title = value;
}

function updateDescription(value: string) {
  const data = selectedNodeData.value;
  if (!data) return;
  data.description = value;
}

function getSelectedParam(key: string) {
  return selectedNodeData.value?.params[key];
}

function getParamValue(key: string) {
  const value = getSelectedParam(key);
  return value === undefined ? '' : value;
}

function onBooleanParamChange(key: string, checked: unknown) {
  updateParam(key, checked === true);
}

function onSelectInputRef(port: OrchestratePortSchema, value: unknown) {
  updateInputRef(port, typeof value === 'string' ? value : '');
}

function eventValue(event: Event) {
  return (event.target as HTMLInputElement | HTMLTextAreaElement).value || '';
}

function onTitleChange(event: Event) {
  updateTitle(eventValue(event));
}

function onDescriptionChange(event: Event) {
  updateDescription(eventValue(event));
}

function onTextParamChange(key: string, event: Event) {
  updateParam(key, eventValue(event));
}

function updateInputRef(port: OrchestratePortSchema, value?: string) {
  port.ref = value || '';
}

function validateFlow(showSuccess = true) {
  const errors: string[] = [];
  const startNodes = nodes.value.filter((item) => item.data.kind === 'start');
  const endNodes = nodes.value.filter((item) => item.data.kind === 'end');

  if (startNodes.length !== 1) errors.push('必须有且只有一个开始节点。');
  if (!endNodes.length) errors.push('至少需要一个结束节点。');

  edges.value.forEach((edge) => {
    if (edge.source === edge.target) errors.push(`连线 ${edge.id} 的两端不能是同一个节点。`);
  });

  const adjacency = new Map<string, string[]>();
  edges.value.forEach((edge) => {
    adjacency.set(edge.source, [...(adjacency.get(edge.source) || []), edge.target]);
  });
  const reachable = new Set<string>();
  const stack = startNodes[0] ? [startNodes[0].id] : [];
  while (stack.length) {
    const current = stack.pop() as string;
    if (reachable.has(current)) continue;
    reachable.add(current);
    stack.push(...(adjacency.get(current) || []));
  }

  nodes.value.forEach((node) => {
    if (node.data.kind !== 'start' && !reachable.has(node.id)) errors.push(`${node.data.title} 未从开始节点连通。`);
    if (node.data.kind === 'judgment' && (adjacency.get(node.id)?.length || 0) < 2) {
      errors.push(`${node.data.title} 至少需要两个输出分支。`);
    }
    node.data.inputs.forEach((input) => {
      if (input.required && !input.ref) errors.push(`${node.data.title} 的 ${input.label} 未配置上游引用。`);
      if (input.ref && !upstreamRefs.value.some((refItem) => refItem.value === input.ref)) {
        errors.push(`${node.data.title} 的 ${input.label} 引用了不存在的输出。`);
      }
    });
    Object.entries(node.data.params).forEach(([key, value]) => {
      if (value === '' || value === null || value === undefined) errors.push(`${node.data.title} 的参数 ${key} 不能为空。`);
    });
  });

  validationErrors.value = errors;
  if (!errors.length && showSuccess) message.success('校验通过，可继续预发布或发布到视觉应用。');
  if (errors.length && showSuccess) message.warning(`发现 ${errors.length} 项需要处理的问题。`);
  return errors.length === 0;
}

function onSave() {
  validateFlow(false);
  message.success('技能编排草稿已保存（仿真）。');
}

function onPublish(label: string) {
  if (!validateFlow(false)) {
    message.warning('请先修复编排校验问题。');
    return;
  }
  publishTarget.value = label;
  publishOpen.value = true;
}

function confirmPublish() {
  publishOpen.value = false;
  message.success(`${publishTarget.value} 已提交，可在技能仓库查看版本与发布状态。`);
}
</script>

<template>
  <div class="official-page skill-orchestrate-page">
    <section class="official-card hero-card">
      <div class="official-page-head">
        <div>
          <div class="title-row">
            <h1 class="official-page-title">技能编排</h1>
            <a-tag color="blue">{{ skillMeta.status }}</a-tag>
            <a-tag>{{ skillMeta.version }}</a-tag>
          </div>
          <p>
            参考识界技能生产文档，将模型、处理、判断和输出节点编排成可发布到视觉应用或技能 API 的视觉 AI 能力。
          </p>
        </div>
        <div class="official-toolbar">
          <a-button>导入模板</a-button>
          <a-button @click="onSave">保存草稿</a-button>
          <a-button @click="validateFlow(true)">校验</a-button>
          <a-button @click="onPublish('发布技能')">发布</a-button>
          <a-button type="primary" @click="onPublish('发布到视觉应用')">发布到视觉应用</a-button>
          <a-button type="primary" ghost @click="onPublish('发布为技能 API')">发布为技能 API</a-button>
        </div>
      </div>
      <div class="stats-grid">
        <article v-for="item in ORCHESTRATE_STATS" :key="item.label" class="official-metric">
          <div>
            <div class="official-metric-value">{{ item.value }}</div>
            <div class="official-metric-label">{{ item.label }}</div>
            <p>{{ item.desc }}</p>
          </div>
        </article>
      </div>
    </section>

    <section class="official-card editor-shell">
      <aside class="node-palette">
        <div class="panel-head">
          <strong>节点库</strong>
          <span>拖入或点击添加</span>
        </div>
        <a-segmented v-model:value="activeCategory" :options="categories" size="small" block />
        <div class="palette-list">
          <button
            v-for="item in palette"
            :key="item.kind"
            class="palette-card"
            type="button"
            @click="addNode(item.kind)"
          >
            <span class="palette-icon" :style="{ color: item.color, backgroundColor: `${item.color}14` }">
              <Icon :icon="item.icon" />
            </span>
            <span>
              <strong>{{ item.title }}</strong>
              <em>{{ item.description }}</em>
            </span>
          </button>
        </div>
        <a-alert
          type="info"
          show-icon
          message="节点能力"
          description="处理节点覆盖区域过滤、尺寸过滤、距离、计数、绊线、位移和目标抠图等识界能力。"
        />
      </aside>

      <main class="canvas-panel">
        <div class="canvas-toolbar">
          <div>
            <strong>{{ skillMeta.name }}</strong>
            <span>开始 → 模型 → 判断 → 处理/大模型 → 结束</span>
          </div>
          <a-space>
            <a-button size="small" @click="fitView({ padding: 0.2 })">适应画布</a-button>
            <a-button size="small" danger @click="clearEdges">清空连线</a-button>
            <a-button size="small" danger :disabled="!selectedNode" @click="deleteSelection">删除节点</a-button>
          </a-space>
        </div>
        <div class="flow-wrap">
          <VueFlow
            v-model:nodes="nodes"
            v-model:edges="edges"
            fit-view-on-init
            class="skill-flow"
            @connect="onConnect"
            @node-click="({ node }) => selectedNodeId = node.id"
          >
            <Background pattern-color="#d7e2f2" :gap="18" />
            <Controls />
            <MiniMap pannable zoomable node-color="#2468f2" />
            <template #node-skillNode="nodeProps">
              <div class="skill-node" :class="{ 'is-selected': nodeProps.selected }">
                <Handle type="target" :position="Position.Left" />
                <div class="skill-node-head">
                  <span :style="{ color: nodeProps.data.color, backgroundColor: `${nodeProps.data.color}14` }">
                    <Icon :icon="nodeProps.data.icon" />
                  </span>
                  <div>
                    <strong>{{ nodeProps.data.title }}</strong>
                    <em>{{ nodeProps.data.category }}</em>
                  </div>
                </div>
                <p>{{ nodeProps.data.description }}</p>
                <div class="ports">
                  <a-tag v-for="port in nodeProps.data.outputs" :key="port.key" color="blue">
                    {{ port.label }} · {{ port.dataType }}
                  </a-tag>
                </div>
                <Handle type="source" :position="Position.Right" />
              </div>
            </template>
          </VueFlow>
        </div>
      </main>

      <aside class="config-panel">
        <div class="panel-head">
          <strong>节点配置</strong>
          <span>{{ selectedNodeData?.title || '未选择节点' }}</span>
        </div>
        <template v-if="selectedNodeData">
          <a-tabs size="small">
            <a-tab-pane key="base" tab="基础配置">
              <a-form layout="vertical">
                <a-form-item label="节点名称">
                  <a-input :value="selectedNodeData.title" @change="onTitleChange" />
                </a-form-item>
                <a-form-item label="节点说明">
                  <a-textarea :value="selectedNodeData.description" :rows="3" @change="onDescriptionChange" />
                </a-form-item>
                <template v-for="(_, key) in selectedNodeData.params" :key="String(key)">
                  <a-form-item :label="String(key)">
                    <a-switch
                      v-if="typeof getSelectedParam(String(key)) === 'boolean'"
                      :checked="Boolean(getSelectedParam(String(key)))"
                      @change="(checked: unknown) => onBooleanParamChange(String(key), Boolean(checked))"
                    />
                    <a-input-number
                      v-else-if="typeof getSelectedParam(String(key)) === 'number'"
                      :value="Number(getSelectedParam(String(key)))"
                      :step="String(key).includes('threshold') ? 0.01 : 1"
                      style="width: 100%"
                      @change="(value: number | string | null) => updateParam(String(key), Number(value || 0))"
                    />
                    <a-textarea
                      v-else-if="String(key).includes('prompt') || String(key).includes('rule') || String(key).includes('Schema')"
                      :value="String(getParamValue(String(key)))"
                      :rows="3"
                      @change="(event: Event) => onTextParamChange(String(key), event)"
                    />
                    <a-input
                      v-else
                      :value="String(getParamValue(String(key)))"
                      @change="(event: Event) => onTextParamChange(String(key), event)"
                    />
                  </a-form-item>
                </template>
              </a-form>
            </a-tab-pane>
            <a-tab-pane key="ports" tab="入参出参">
              <div class="port-section">
                <h4>输入引用</h4>
                <a-empty v-if="!selectedNodeData.inputs.length" description="开始节点无需输入" />
                <a-form v-else layout="vertical">
                  <a-form-item v-for="port in selectedNodeData.inputs" :key="port.key" :label="`${port.label}（${port.dataType}）`">
                    <a-select
                      :value="port.ref"
                      allow-clear
                      :options="upstreamRefs"
                      placeholder="选择上游节点输出"
                      @change="(value: unknown) => onSelectInputRef(port, value)"
                    />
                  </a-form-item>
                </a-form>
              </div>
              <div class="port-section">
                <h4>输出字段</h4>
                <a-tag v-for="port in selectedNodeData.outputs" :key="port.key" color="blue">
                  {{ port.key }} / {{ port.label }} / {{ port.dataType }}
                </a-tag>
                <a-empty v-if="!selectedNodeData.outputs.length" description="结束节点不再输出" />
              </div>
            </a-tab-pane>
            <a-tab-pane key="validate" tab="校验结果">
              <a-alert
                v-if="!validationErrors.length"
                type="success"
                show-icon
                message="当前未发现校验错误"
                description="点击顶部校验可重新检查连通性、必填参数和引用关系。"
              />
              <a-list v-else size="small" bordered :data-source="validationErrors">
                <template #renderItem="{ item }">
                  <a-list-item>{{ item }}</a-list-item>
                </template>
              </a-list>
            </a-tab-pane>
          </a-tabs>
        </template>
        <a-empty v-else description="请选择画布中的节点" />
      </aside>
    </section>

    <a-modal
      v-model:open="publishOpen"
      :title="publishTarget"
      width="640px"
      ok-text="发布"
      @ok="confirmPublish"
    >
      <a-form layout="vertical" class="publish-form">
        <a-form-item label="版本号">
          <a-input v-model:value="publishForm.version" addon-before="V" placeholder="请输入版本号" />
        </a-form-item>
        <a-form-item label="版本描述">
          <a-textarea v-model:value="publishForm.description" :rows="3" placeholder="请输入本次发布更新内容" />
        </a-form-item>
        <a-form-item label="发布渠道">
          <a-space direction="vertical" class="publish-channel-list">
            <a-checkbox v-model:checked="publishForm.publishToVision">
              发布到视觉应用
              <span>技能可在视觉应用中被添加到点位、运行计划和预警流程。</span>
            </a-checkbox>
            <a-checkbox v-model:checked="publishForm.publishAsApi">
              发布为技能 API
              <span>发布后在技能仓库查看 Endpoint，并在安全认证中创建 API Key。</span>
            </a-checkbox>
          </a-space>
        </a-form-item>
        <a-alert
          type="info"
          show-icon
          message="发布后技能版本可在技能仓库管理"
          description="后续可下线 API、导出离线包、覆盖草稿或查看调用监控。"
        />
      </a-form>
    </a-modal>
  </div>
</template>

<style lang="scss" scoped>
.skill-orchestrate-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
  overflow: hidden;
}

.hero-card,
.editor-shell {
  padding: 16px;
}

.hero-card p,
.official-metric p,
.panel-head span,
.canvas-toolbar span,
.palette-card em,
.skill-node em,
.skill-node p {
  margin: 0;
  color: $text-secondary;
}

.title-row,
.skill-node-head,
.canvas-toolbar,
.panel-head {
  display: flex;
  align-items: center;
  gap: 10px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-top: 16px;
}

.editor-shell {
  flex: 1;
  min-height: 620px;
  display: grid;
  grid-template-columns: 270px minmax(0, 1fr) 330px;
  gap: 14px;
  overflow: hidden;
}

.node-palette,
.canvas-panel,
.config-panel {
  min-height: 0;
  border: 1px solid $divider;
  border-radius: 16px;
  background: #fff;
}

.node-palette,
.config-panel {
  padding: 14px;
  overflow: auto;
}

.panel-head {
  justify-content: space-between;
  margin-bottom: 12px;

  strong {
    color: $text-primary;
  }

  span {
    font-size: 12px;
  }
}

.palette-list {
  display: grid;
  gap: 10px;
  margin: 12px 0;
}

.palette-card {
  display: flex;
  gap: 10px;
  width: 100%;
  padding: 12px;
  text-align: left;
  border: 1px solid #e5edf9;
  border-radius: 14px;
  background: #f8fbff;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: $brand-blue;
    box-shadow: $shadow-card;
    transform: translateY(-1px);
  }

  strong,
  em {
    display: block;
  }

  strong {
    margin-bottom: 4px;
    color: $text-primary;
  }

  em {
    font-size: 12px;
    font-style: normal;
    line-height: 1.5;
  }
}

.palette-icon,
.skill-node-head span {
  width: 34px;
  height: 34px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 20px;
}

.canvas-panel {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #f6f9ff;
}

.canvas-toolbar {
  justify-content: space-between;
  padding: 12px 14px;
  border-bottom: 1px solid $divider;
  background: #fff;

  div {
    display: grid;
    gap: 3px;
  }
}

.flow-wrap {
  flex: 1;
  min-height: 0;
}

.skill-flow {
  width: 100%;
  height: 100%;
}

.skill-node {
  width: 240px;
  padding: 12px;
  border: 1px solid #dbe7f6;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 10px 28px rgba(39, 76, 119, 0.12);

  &.is-selected {
    border-color: $brand-blue;
    box-shadow: 0 0 0 3px rgba(36, 104, 242, 0.12), 0 10px 28px rgba(39, 76, 119, 0.16);
  }

  strong,
  em {
    display: block;
  }

  em {
    font-size: 12px;
    font-style: normal;
  }

  p {
    margin-top: 10px;
    font-size: 12px;
    line-height: 1.6;
  }
}

.ports {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

.port-section {
  margin-bottom: 16px;

  h4 {
    margin: 0 0 10px;
    color: $text-primary;
  }
}

:deep(.vue-flow__handle) {
  width: 10px;
  height: 10px;
  border-color: #fff;
  background: $brand-blue;
}

:deep(.vue-flow__minimap) {
  border-radius: 12px;
  overflow: hidden;
}

.publish-form {
  .publish-channel-list {
    width: 100%;

    span {
      display: block;
      margin-top: 4px;
      color: $text-secondary;
      font-size: 12px;
      line-height: 1.5;
    }
  }
}


@media (max-width: 1360px) {
  .editor-shell {
    grid-template-columns: 240px minmax(0, 1fr);
  }

  .config-panel {
    grid-column: 1 / -1;
    max-height: 360px;
  }
}
</style>
