<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const categories = [
  '全部', '视觉模型', '目标检测', '图像单标签分类', '图像多属性分类', 
  '语义分割', '实例分割', '多模态大模型', '图片问答'
];
const hardwareOptions = [
  '全部', '英伟达A10', '英伟达A100', '英伟达A40', '华为Ascend910B', '华为Atlas300I', '华为Atlas310P', 
  '比特大陆BM1684', '比特大陆BM1684X', '比特大陆BM1688', '昆仑芯K200', '天数智芯MRV100', 
  '天数智芯MRV50', '昆仑芯P800', '昆仑芯R200', '英伟达RTX4090', '英伟达T4', '英伟达V100'
];

const searchForm = reactive({
  keyword: '',
  category: [] as string[],
  hardware: [] as string[],
});

const showFilter = ref(true);

const filterCount = computed(() => {
  return searchForm.category.length + searchForm.hardware.length;
});

function toggleFilter() {
  showFilter.value = !showFilter.value;
}

function clearFilters() {
  searchForm.category = [];
  searchForm.hardware = [];
  searchForm.keyword = '';
}

const mockModels = [
  {
    id: 'c-opaomateyuyifengemoxing-T4-moxb',
    title: '工厂注塑料产品缺陷 模型-T4-模型包',
    category: '视觉/模型包/语义分割',
    hardware: '英伟达T4',
    date: '2026-03-31 22:43:49',
    icon: 'i-mdi-hexagon-multiple-outline'
  },
  {
    id: 'c-nxizucheqitiemajiance-R200-moxb',
    title: '阳车器铁马检测-R200-模型包',
    category: '视觉/模型包/目标检测',
    hardware: '昆仑芯R200',
    date: '2026-03-31 22:43:49',
    icon: 'i-mdi-hexagon-multiple-outline'
  },
  {
    id: 'fengmenjiance-R200-moxingbao',
    title: '风门检测模型-R200-模型包',
    category: '视觉/模型包/目标检测',
    hardware: '昆仑芯R200',
    date: '2026-03-31 22:43:48',
    icon: 'i-mdi-hexagon-multiple-outline'
  },
  {
    id: 'c-jiance-wugenzong-R200-moxingbao',
    title: '贴附检测-无跟踪-R200-模型包',
    category: '视觉/模型包/目标检测',
    hardware: '昆仑芯R200',
    date: '2026-03-31 22:43:47',
    icon: 'i-mdi-hexagon-multiple-outline'
  },
  {
    id: 'ks-tsj-cls-R200-ensemble',
    title: '矿山提升机运动-R200',
    category: '视觉/模型包/图像单标...',
    hardware: '昆仑芯R200',
    date: '2026-03-31 22:42:19',
    icon: 'i-mdi-hexagon-multiple-outline'
  },
  {
    id: 'ensemble',
    title: '其他场景实例分割_抠图切图_缺陷识别-R200-模型包',
    category: '视觉/模型包/实例分割',
    hardware: '昆仑芯R200',
    date: '2026-03-31 22:42:19',
    icon: 'i-mdi-hexagon-multiple-outline'
  },
  {
    id: 'zsh_falan_mismatched-R200-moxingb',
    title: '法兰不配对识别-R200-模型包',
    category: '视觉/模型包/目标检测',
    hardware: '昆仑芯R200',
    date: '2026-03-31 22:42:19',
    icon: 'i-mdi-hexagon-multiple-outline'
  },
  {
    id: 'zsh_falan_unprotected-R200-moxb',
    title: '法兰未保护识别-R200-模型包',
    category: '视觉/模型包/目标检测',
    hardware: '昆仑芯R200',
    date: '2026-03-31 22:42:19',
    icon: 'i-mdi-hexagon-multiple-outline'
  }
];

const filteredModels = computed(() => {
  let result = mockModels.filter(model => {
    if (searchForm.keyword && !model.title.includes(searchForm.keyword) && !model.id.includes(searchForm.keyword)) {
      return false;
    }
    if (searchForm.category.length > 0) {
      // 简单模拟分类匹配
      const match = searchForm.category.some(cat => model.category.includes(cat) || (cat === '目标检测' && model.category.includes('目标检测')));
      if (!match) return false;
    }
    if (searchForm.hardware.length > 0) {
      const match = searchForm.hardware.some(hw => model.hardware.includes(hw));
      if (!match) return false;
    }
    return true;
  });
  return result;
});

function toggleCategory(cat: string) {
  if (cat === '全部') {
    searchForm.category = [];
    return;
  }
  const idx = searchForm.category.indexOf(cat);
  if (idx > -1) {
    searchForm.category.splice(idx, 1);
  } else {
    searchForm.category.push(cat);
  }
}

function toggleHardware(hw: string) {
  if (hw === '全部') {
    searchForm.hardware = [];
    return;
  }
  const idx = searchForm.hardware.indexOf(hw);
  if (idx > -1) {
    searchForm.hardware.splice(idx, 1);
  } else {
    searchForm.hardware.push(hw);
  }
}

function goToDetail(id: string) {
  router.push({ path: `/studio/explore/scenes/detail/${id}` });
}
</script>

<template>
  <div class="official-page scene-model-page">
    <div class="official-page-head" style="position: sticky; top: 0; z-index: 10;">
      <h1 class="official-page-title">场景模型</h1>
    </div>

    <div class="official-card page-card" style="padding: 24px;">
      <!-- Filters -->
      <div class="filter-section">
        <div class="search-row">
          <a-button-group class="filter-btn-group" style="margin-right: 16px;">
            <a-button 
              @click="toggleFilter"
              class="filter-toggle-btn"
              :class="{ 'is-active': showFilter }"
            >
              <span :class="showFilter ? 'i-mdi-menu-down' : 'i-mdi-menu-right'" style="margin-right: 4px; font-size: 16px; margin-left: -4px; color: #1d2129;"></span>
              <span style="color: #1d2129;">模型筛选</span>
              <span v-if="filterCount > 0" class="filter-badge">{{ filterCount }}</span>
            </a-button>
            <a-tooltip title="清空所有筛选项">
              <a-button 
                class="clear-filter-btn" 
                @click="clearFilters"
                :class="{ 'is-active': showFilter }"
              >
                <span class="i-mdi-broom" style="font-size: 16px; color: #1677ff;"></span>
              </a-button>
            </a-tooltip>
          </a-button-group>

          <a-input
            v-model:value="searchForm.keyword"
            placeholder="请输入模型名称或ID搜索"
            style="width: 320px;"
            allow-clear
          >
            <template #prefix>
              <span class="i-mdi-magnify" style="color: #86909c; font-size: 16px;"></span>
            </template>
          </a-input>
        </div>

        <transition name="filter-collapse">
          <div v-show="showFilter" class="filter-options-wrap">
            <div class="tag-row">
              <div class="tag-label">模型分类</div>
              <div class="tag-list">
                <div 
                  class="tag-item"
                  :class="{ active: searchForm.category.length === 0 }"
                  @click="toggleCategory('全部')"
                >
                  全部
                </div>
                <template v-for="cat in categories.filter(c => c !== '全部')" :key="cat">
                <div v-if="cat === '多模态大模型'" class="divider" style="color: #e5e6eb;">|</div>
                <div 
                  class="tag-item"
                  :class="{ active: searchForm.category.includes(cat) }"
                  @click="toggleCategory(cat)"
                >
                  <span v-if="cat === '多模态大模型'" class="i-mdi-star-four-points-outline" style="margin-right: 4px; font-size: 14px;"></span>
                  {{ cat }}
                  <span v-if="searchForm.category.includes(cat)" class="i-mdi-close close-icon" @click.stop="toggleCategory(cat)"></span>
                </div>
              </template>
              </div>
            </div>

            <div class="tag-row">
              <div class="tag-label">AI加速硬件</div>
              <div class="tag-list">
                <div 
                  class="tag-item"
                  :class="{ active: searchForm.hardware.length === 0 }"
                  @click="toggleHardware('全部')"
                >
                  全部
                </div>
                <div 
                v-for="hw in hardwareOptions.filter(h => h !== '全部')" 
                :key="hw"
                class="tag-item"
                :class="{ active: searchForm.hardware.includes(hw) }"
                @click="toggleHardware(hw)"
              >
                {{ hw }}
                <span v-if="searchForm.hardware.includes(hw)" class="i-mdi-close close-icon" @click.stop="toggleHardware(hw)"></span>
              </div>
              </div>
            </div>
          </div>
        </transition>
      </div>

      <!-- Cards Grid -->
      <div class="model-grid">
        <!-- Banner Card -->
        <div class="model-card banner-card">
          <div class="banner-content">
            <h2 class="banner-title">一见多模态大模型-VQA-Pro</h2>
            <p class="banner-subtitle">一见多模态大模型-VQA-Pro</p>
            <a-button type="primary" class="experience-btn">
              立即体验 <span class="i-mdi-arrow-right" style="margin-left: 4px;"></span>
            </a-button>
          </div>
          <div class="banner-bg"></div>
        </div>

        <!-- Normal Cards -->
        <div v-for="model in filteredModels" :key="model.id" class="model-card normal-card" @click="goToDetail(model.id)">
          <div class="card-content">
            <div class="card-header">
              <div class="icon-wrap">
                <span :class="model.icon"></span>
              </div>
              <div class="title-wrap">
                <h3 class="model-title" :title="model.title">{{ model.title }}</h3>
                <div class="model-id">
                  <span class="id-tag">ID</span> {{ model.id }}
                </div>
              </div>
            </div>
            <div class="card-tags">
              <span class="tag"><span class="i-mdi-file-document-outline"></span> {{ model.category }}</span>
              <span class="tag hardware-tag"><span class="i-mdi-memory"></span> {{ model.hardware }}</span>
            </div>
          </div>
          
          <div class="card-hover-mask">
            <a-button class="view-detail-btn" block @click.stop="goToDetail(model.id)">查看详情</a-button>
          </div>
          
          <div class="card-footer">
            <span class="provider">百度一见</span>
            <span class="date">{{ model.date }} 更新</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.scene-model-page {
  padding: 24px;
  min-height: 100vh;
  background: #fff;
}

.official-page-head {
  padding: 0 !important;
  background: #fff;
  padding-bottom: 16px;
  .official-page-title {
    font-size: 20px;
    font-weight: bold;
    color: #1d2129;
    margin: 0;
  }
}

.official-card {
  background: #fff;
  border-radius: 8px;
}

/* Filters */
.filter-section {
  border-radius: 4px;
  margin-bottom: 24px;
}

.filter-toggle-btn {
  display: flex;
  align-items: center;
  color: #1d2129;
  border-color: #d9d9d9;
  
  &.is-active {
    color: #1677ff;
    border-color: #1677ff;
    
    .i-mdi-menu-down {
      color: #1677ff !important;
    }
  }
}

.clear-filter-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  border-color: #d9d9d9;
  
  &.is-active {
    border-color: #1677ff;
  }
}

.filter-btn-group {
  .ant-btn {
    &:focus, &:hover {
      z-index: 1;
    }
  }
}

.filter-badge {
  background: #e6f4ff;
  color: #1677ff;
  font-size: 12px;
  line-height: 20px;
  padding: 0 6px;
  border-radius: 10px;
  margin-left: 6px;
  min-width: 16px;
  text-align: center;
  font-weight: 500;
}

.search-row {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  
  :deep(.ant-input-affix-wrapper) {
    border-radius: 4px;
  }
}

.filter-options-wrap {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tag-row {
  display: flex;
  align-items: flex-start;
  font-size: 14px;
}

.tag-label {
  color: #86909c;
  width: 90px;
  flex-shrink: 0;
  padding-top: 2px;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  flex: 1;
  align-items: center;
}

.tag-item {
    cursor: pointer;
    color: #4e5969;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    padding: 4px 12px;
    border-radius: 4px;
    gap: 4px;

    &:hover {
      color: #1677ff;
    }

    &.active {
      color: #1677ff;
      font-weight: 500;
      background: #e8f3ff;
    }
    
    .close-icon {
      font-size: 14px;
      margin-left: 2px;
      margin-right: -4px;
      opacity: 0.8;
      
      &:hover {
        opacity: 1;
      }
    }
  }

.filter-collapse-enter-active,
.filter-collapse-leave-active {
  transition: all 0.3s ease-in-out;
  max-height: 300px;
  opacity: 1;
}

.filter-collapse-enter-from,
.filter-collapse-leave-to {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
}

.divider {
  color: #e5e6eb;
  margin: 0 8px;
}

/* Grid */
.model-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 20px;
}

/* Cards */
.model-card {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
  border: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  background: #fff;

  &:hover {
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
    
    .card-hover-mask {
      opacity: 1;
      transform: translateY(0);
    }
  }
}

/* Banner Card */
.banner-card {
  grid-column: span 1;
  @media (min-width: 1440px) {
    grid-column: span 2;
  }
  background: linear-gradient(135deg, #e6f0ff 0%, #d6e8ff 100%);
  border: none;
  display: flex;
  padding: 32px 24px;
  justify-content: space-between;
  
  .banner-content {
    position: relative;
    z-index: 2;
    max-width: 60%;
  }

  .banner-title {
    font-size: 24px;
    font-weight: 600;
    color: #1d2129;
    margin-bottom: 8px;
  }

  .banner-subtitle {
    font-size: 14px;
    color: #4e5969;
    margin-bottom: 24px;
  }

  .experience-btn {
    background: #1d2129;
    border-color: #1d2129;
    border-radius: 20px;
    display: inline-flex;
    align-items: center;
    padding: 0 20px;
    height: 36px;
    
    &:hover {
      background: #4e5969;
      border-color: #4e5969;
    }
  }

  .banner-bg {
    position: absolute;
    right: 0;
    bottom: 0;
    width: 200px;
    height: 100%;
    background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23ffffff" fill-opacity="0.3" x="20" y="20" width="60" height="60" rx="10"/></svg>') no-repeat right bottom;
    background-size: contain;
    z-index: 1;
  }
}

/* Normal Card */
.normal-card {
  cursor: pointer;
  padding: 24px 20px 20px;
  justify-content: space-between;
  min-height: 250px;
  
  .card-content {
    flex: 1;
  }

  .card-header {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
  }

  .icon-wrap {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: linear-gradient(135deg, #4b8af3, #2468f2);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 24px;
    flex-shrink: 0;
  }

  .title-wrap {
    flex: 1;
    min-width: 0;
  }

  .model-title {
    font-size: 16px;
    font-weight: 500;
    color: #1d2129;
    margin: 0 0 6px 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .model-id {
    font-size: 12px;
    color: #86909c;
    display: flex;
    align-items: center;
    gap: 6px;
    
    .id-tag {
      border: 1px solid #e5e6eb;
      border-radius: 2px;
      padding: 0 4px;
      font-size: 10px;
      line-height: 14px;
    }
  }

  .card-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 40px;

    .tag {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: #f2f3f5;
      color: #4e5969;
      font-size: 12px;
      padding: 4px 8px;
      border-radius: 4px;
    }
  }
  
  .card-hover-mask {
    position: absolute;
    bottom: 56px;
    left: 20px;
    right: 20px;
    opacity: 0;
    transform: translateY(10px);
    transition: all 0.3s;
    background: #fff;
    padding-top: 12px;
    padding-bottom: 12px;
    
    .view-detail-btn {
      color: #1677ff;
      border-color: #1677ff;
      border-radius: 4px;
      height: 32px;
      background: transparent;
      
      &:hover {
        color: #1677ff;
        border-color: #1677ff;
        background: #f0f5ff;
      }
    }
  }

  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: #86909c;
    border-top: 1px solid #f0f0f0;
    padding-top: 16px;
    margin-top: auto;
  }
}
</style>
