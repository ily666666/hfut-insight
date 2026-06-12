<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { Connection } from '@vue-flow/core';
import { Handle, Position, VueFlow, useVueFlow } from '@vue-flow/core';
import { Background } from '@vue-flow/background';
import { Controls } from '@vue-flow/controls';
import { MiniMap } from '@vue-flow/minimap';

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
const activeCategory = ref(['模型节点', '处理节点', '判断节点']);
// Ensure display mode is grid by default
  const displayMode = ref<'grid' | 'list'>('grid');
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
const route = useRoute();
const router = useRouter();

watch(
  () => route.query,
  (query) => {
    if (typeof query.name === 'string' && query.name) {
      skillMeta.name = query.name;
    }
    if (typeof query.status === 'string' && query.status) {
      skillMeta.status = query.status.includes('已发布') ? '已发布' : '草稿';
    }
  },
  { immediate: true },
);

function goBack() {
  router.push('/studio/workspace/orchestrate');
}

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

const editSkillOpen = ref(false);
const editSkillForm = reactive({
  name: '嗯嗯',
  description: '嗯嗯',
});

function onEditSkill() {
  editSkillForm.name = skillMeta.name;
  editSkillForm.description = '嗯嗯';
  editSkillOpen.value = true;
}

function confirmEditSkill() {
  skillMeta.name = editSkillForm.name;
  editSkillOpen.value = false;
  message.success('技能基础信息已保存');
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
  <div class="official-page skill-orchestrate-page" style="padding: 0; background: #f2f3f5; border-bottom: 1px solid #f0f0f0;">
    <section class="official-card hero-card" style="border: none; box-shadow: none; border-bottom: 1px solid #e5e6eb; padding: 12px 16px; padding-left: 8px; background: #fff; border-radius: 0; height: 60px; display: flex; align-items: center;">
      <div class="official-page-head" style="margin-bottom: 0; width: 100%; display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center; gap: 8px;">
             <a-button type="text" style="padding: 0; display: flex; align-items: center; color: #1d2129; margin-left: -22px;" @click="goBack">
              <span class="i-mdi-chevron-left" style="font-size: 24px;"></span>
            </a-button>
            <div class="skill-icon-placeholder" style="width: 32px; height: 32px; background: #1677ff; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #fff;">
            <span class="i-mdi-sitemap" style="font-size: 20px;"></span>
          </div>
          <div>
            <div class="title-row" style="margin-bottom: 4px; display: flex; align-items: center;">
              <h1 class="official-page-title" style="font-size: 16px; margin: 0; font-weight: 500; text-align: left;">{{ skillMeta.name }}</h1>
              <a-button type="text" size="small" style="color: #86909c; padding: 0 4px;" @click="onEditSkill">
                <span class="i-mdi-square-edit-outline" style="font-size: 16px;"></span>
              </a-button>
            </div>
            <div style="display: flex; align-items: center; gap: 12px; font-size: 12px; color: #86909c;">
              <span style="background: #f2f3f5; padding: 2px 6px; border-radius: 4px; display: flex; align-items: center; gap: 4px;">
                ID: {{ typeof route.query.id === 'string' && route.query.id ? route.query.id : 'c-sk-ecppnvem' }}
                <span class="i-mdi-content-copy" style="cursor: pointer;"></span>
              </span>
              <span style="display: flex; align-items: center; gap: 4px;">
                <span class="i-mdi-check-circle-outline"></span>
                保存于2026-06-09 17:21:02
              </span>
            </div>
          </div>
        </div>
        <div class="official-toolbar" style="display: flex; gap: 12px; align-items: center;">
          <a-button type="text" style="color: #86909c; padding: 0 8px;"><span class="i-mdi-history" style="font-size: 16px;"></span></a-button>
          <a-button><span class="i-mdi-play-outline" style="margin-right: 4px;"></span>试运行</a-button>
          <a-button>预发布</a-button>
          <a-button type="primary" @click="onPublish('发布技能')"><span class="i-mdi-send-outline" style="margin-right: 4px;"></span>发布</a-button>
          <a-button type="text" style="color: #86909c; padding: 0 8px;"><span class="i-mdi-content-copy" style="font-size: 16px;"></span></a-button>
        </div>
      </div>
    </section>

    <section class="official-card editor-shell" style="border: none; box-shadow: none; padding: 0; background: transparent;">
      <aside class="node-palette" style="border-radius: 12px; margin-left: 12px; margin-bottom: 12px; height: calc(100vh - 84px); display: flex; flex-direction: column; width: 240px; padding: 12px 0 0 0; position: relative;">
        <div class="panel-head" style="padding: 0 16px; margin-bottom: 8px;">
          <a-input placeholder="搜索节点名称及描述" style="width: 100%; border-radius: 4px; border-color: #d9d9d9;" class="custom-search">
            <template #suffix>
              <span class="i-mdi-magnify" style="color: #86909c; cursor: pointer; font-size: 16px;"></span>
            </template>
          </a-input>
        </div>
        
        <div style="flex: 1; overflow-y: auto; overflow-x: hidden;">
          <a-collapse v-model:activeKey="activeCategory" :bordered="false" style="background: transparent;" class="custom-collapse" expand-icon-position="end">
            <a-collapse-panel v-for="cat in ['模型节点', '处理节点', '判断节点']" :key="cat" style="border-bottom: 0; padding: 0;">
              <template #header>
                <div style="display: flex; align-items: center; gap: 4px;">
                  <span style="font-weight: 500; font-size: 13px; color: #1d2129;">{{ cat }}</span>
                  <span class="i-mdi-help-circle-outline" style="color: #c9cdd4; font-size: 14px;"></span>
                </div>
              </template>
              <div class="palette-list" style="padding: 0 8px;">
                <button
                  v-for="item in ORCHESTRATE_NODE_PALETTE.filter(p => (cat === '模型节点' && ['视觉模型节点', '多模态大模型节点', '视觉模型', '多模态大模型'].includes(p.title)) || (cat === '判断节点' && ['条件分支', '判断节点'].includes(p.title)) || (cat === '处理节点' && !['视觉模型节点', '多模态大模型节点', '视觉模型', '多模态大模型', '条件分支', '判断节点', '开始节点', '结束节点', '开始', '结束'].includes(p.title)))"
                  :key="item.kind"
                  class="palette-card"
                  type="button"
                  @click="addNode(item.kind)"
                  style="border: none; background: transparent; padding: 8px; align-items: flex-start; gap: 8px; margin-bottom: 0;"
                >
                  <span class="palette-icon" :style="{ color: item.color, backgroundColor: `${item.color}14`, width: '24px', height: '24px', borderRadius: '4px', fontSize: '14px', marginTop: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }">
                    <span :class="item.icon" />
                  </span>
                  <span style="flex: 1;">
                    <strong style="font-size: 13px; font-weight: 500; margin-bottom: 2px; color: #1d2129;">{{ item.title.replace('节点', '') }} <span style="float: right; background: #f2f3f5; color: #86909c; font-weight: normal; font-size: 12px; padding: 0 4px; border-radius: 4px; transform: scale(0.83); transform-origin: right center;">V2</span></strong>
                    <div style="color: #86909c; font-size: 12px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; font-style: normal; white-space: normal;">{{ item.description }}</div>
                  </span>
                </button>
              </div>
            </a-collapse-panel>
          </a-collapse>
        </div>
        
        <div style="width: 4px; height: 32px; background: #e5e6eb; border-radius: 4px; position: absolute; right: 2px; top: 50%; transform: translateY(-50%); cursor: pointer; z-index: 10;"></div>
      </aside>

      <main class="canvas-panel" style="background: transparent; border: none; border-radius: 0;">
        <div class="flow-wrap" style="background: transparent; position: relative;">
          <div class="canvas-toolbar" style="background: transparent; border-bottom: none; position: absolute; bottom: 24px; left: 50%; transform: translateX(-50%); z-index: 10; padding: 0;">
            <div style="background: white; padding: 6px; border-radius: 8px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); display: flex; gap: 8px;">
              <a-button type="text" style="padding: 4px 8px; color: #4e5969;"><span class="i-mdi-view-grid-outline"></span></a-button>
              <a-button type="text" style="padding: 4px 8px; color: #4e5969;" @click="fitView({ padding: 0.2 })"><span class="i-mdi-fit-to-page-outline"></span></a-button>
              <div style="width: 1px; height: 20px; background: #e5e6eb; margin: auto 4px;"></div>
              <a-button type="text" style="padding: 4px 8px; color: #4e5969;"><span class="i-mdi-magnify-minus-outline"></span></a-button>
              <span style="font-size: 13px; color: #1d2129; line-height: 32px; padding: 0 4px;">67%</span>
              <a-button type="text" style="padding: 4px 8px; color: #4e5969;"><span class="i-mdi-magnify-plus-outline"></span></a-button>
              <div style="width: 1px; height: 20px; background: #e5e6eb; margin: auto 4px;"></div>
              <a-button type="text" style="padding: 4px 8px; color: #4e5969;"><span class="i-mdi-arrow-collapse-all"></span></a-button>
            </div>
          </div>
          <VueFlow
            v-model:nodes="nodes"
            v-model:edges="edges"
            fit-view-on-init
            class="skill-flow"
            @connect="onConnect"
            @node-click="({ node }) => selectedNodeId = node.id"
          >
            <Background pattern-color="#d7e2f2" :gap="18" />
            <MiniMap pannable zoomable node-color="#2468f2" style="display: none;" />
            <template #node-skillNode="nodeProps">
              <div class="skill-node" :class="{ 'is-selected': nodeProps.selected }">
                <Handle type="target" :position="Position.Left" />
                <div class="skill-node-head">
                  <span :style="{ color: nodeProps.data.color, backgroundColor: `${nodeProps.data.color}14` }">
                    <span :class="nodeProps.data.icon" />
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

      <aside v-if="selectedNodeData" class="config-panel" style="border-radius: 12px; margin-right: 12px; margin-bottom: 12px; height: calc(100vh - 84px); width: 280px; display: flex; flex-direction: column; padding: 0; position: relative;">
        <div class="panel-head" style="padding: 16px 16px 0; margin-bottom: 0;">
          <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
            <strong style="font-size: 14px; font-weight: 600;">节点配置</strong>
            <span style="font-size: 12px; color: #86909c;">视觉模型节点</span>
          </div>
        </div>
        <template v-if="selectedNodeData">
          <a-tabs size="small" style="padding: 0 16px; flex: 1; overflow-y: auto;">
            <a-tab-pane key="base" tab="基础配置">
              <a-form layout="vertical" style="margin-top: 12px;">
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
        <div style="position: absolute; left: -16px; top: 50%; transform: translateY(-50%); cursor: pointer; width: 16px; height: 32px; display: flex; align-items: center; justify-content: center; background: #fff; border-radius: 4px 0 0 4px; box-shadow: -2px 0 8px rgba(0,0,0,0.04); z-index: 10;">
          <div style="width: 4px; height: 16px; background: #e5e6eb; border-radius: 2px;"></div>
        </div>
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
    <a-modal
      v-model:open="editSkillOpen"
      :title="`编辑技能（${skillMeta.name}）`"
      width="640px"
      ok-text="确定"
      cancel-text="取消"
      @ok="confirmEditSkill"
    >
      <a-form layout="vertical" class="publish-form" style="margin-top: 24px;">
        <a-form-item label="技能名称" required>
          <a-input v-model:value="editSkillForm.name" placeholder="请输入技能名称" suffix="2/100" />
          <div style="font-size: 12px; color: #86909c; margin-top: 4px;">仅支持数字、中文、大小写英文字母、非特殊符号，不允许空格</div>
        </a-form-item>
        <a-form-item label="技能描述">
          <a-textarea v-model:value="editSkillForm.description" :rows="3" placeholder="请输入技能描述" />
          <div style="text-align: right; font-size: 12px; color: #86909c; margin-top: -24px; margin-right: 12px; position: relative; z-index: 1;">2/255</div>
        </a-form-item>
        <a-form-item label="自定义标签">
          <a-button type="link" style="padding: 0;"><span class="i-mdi-plus"></span>添加标签 (0/20)</a-button>
          <div style="font-size: 12px; color: #86909c; margin-top: 4px;">标签名不可重复，且标签名称和字符串类型标签内容仅支持字母、数字、中文、下划线“_”和连字符“-”</div>
        </a-form-item>
        <a-form-item label="技能配图" required>
          <div style="width: 160px; height: 90px; border-radius: 8px; overflow: hidden; position: relative; cursor: pointer;">
            <img src="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=2070&auto=format&fit=crop" style="width: 100%; height: 100%; object-fit: cover;" />
            <div style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.5); color: white; text-align: center; font-size: 12px; padding: 4px 0;">修改配图</div>
          </div>
        </a-form-item>
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
  display: flex;
  gap: 0;
  overflow: hidden;
  position: relative;
}

.canvas-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: transparent;
}

.node-palette,
.config-panel {
  min-height: 0;
  border: none;
  background: #fff;
  box-shadow: 0 4px 16px rgba(0,0,0,0.04);
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

.custom-search {
  border-radius: 4px !important;
}

.custom-search:hover, .custom-search:focus-within {
  border-color: #1677ff !important;
  box-shadow: none !important;
}

.custom-search :deep(.ant-input) {
  border: none !important;
  box-shadow: none !important;
}
.custom-collapse :deep(.ant-collapse-item) {
  border-bottom: none;
}

.custom-collapse :deep(.ant-collapse-header) {
  padding: 8px 16px !important;
  color: #1d2129;
}

.custom-collapse :deep(.ant-collapse-expand-icon) {
  padding-inline-end: 8px !important;
  transform: translateY(0);
}

.custom-collapse :deep(.ant-collapse-expand-icon svg) {
  transform: rotate(90deg) scale(0.8) !important;
}

.custom-collapse :deep(.ant-collapse-item-active .ant-collapse-expand-icon svg) {
  transform: rotate(-90deg) scale(0.8) !important;
}

.custom-collapse :deep(.ant-collapse-content-box) {
  padding: 0 0 16px 0 !important;
}

.palette-card {
  display: flex;
  gap: 8px;
  width: 100%;
  padding: 8px;
  text-align: left;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s;
}

  
.palette-card:hover {
  background: #f2f3f5;
  border-radius: 8px;
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
