<script setup lang="ts">
import { ref, reactive } from 'vue';

const categories = ['全部', '快递', '通用', '水务', '煤矿', '工厂', '家居', '安防', '电力', '化工', '铁路', '港口', '邮轮', '油气', '钢铁'];
const hardwareOptions = [
  '全部', '英伟达A10', '英伟达A100', '英伟达A40', '华为Ascend910B', '华为Atlas300I', '华为Atlas310P', 
  '比特大陆BM1684', '比特大陆BM1684X', '比特大陆BM1688', '昆仑芯K200', '天数智芯MRV100', 
  '天数智芯MRV50', '昆仑芯P800', '昆仑芯R200', '英伟达RTX4090', '英伟达T4', '英伟达V100'
];

const searchForm = reactive({
  keyword: '',
  onlyLargeModel: false,
  category: '全部',
  hardware: '全部',
  sort: '最近更新',
});

const showBanner = ref(true);

const mockSkills = [
  {
    id: 1,
    title: '动火作业区灭火器未配置',
    isNew: true,
    category: '化工',
    hardware: '昆仑芯R200',
    desc: '实时监测动火作业区灭火器配置情况，当进...',
    date: '2026-05-28',
    image: 'https://dummyimage.com/300x160/3b82f6/fff.png&text=Fire+Extinguisher'
  },
  {
    id: 2,
    title: '港口摘装锁垫人员双脚站立于...',
    isNew: true,
    isLargeModel: true,
    category: '港口',
    hardware: '昆仑芯R200 + 英伟达...',
    desc: '实时监测港口摘装锁垫人员双脚站立于锁垫...',
    date: '2026-05-28',
    image: 'https://dummyimage.com/300x160/3b82f6/fff.png&text=Port+Worker'
  },
  {
    id: 3,
    title: '天车重物下方人员违规靠近',
    isNew: true,
    category: '煤矿',
    hardware: '昆仑芯R200',
    desc: '识别煤矿井下摘装站天车运输重物期间人员...',
    date: '2026-05-28',
    image: 'https://dummyimage.com/300x160/3b82f6/fff.png&text=Crane+Warning'
  },
  {
    id: 4,
    title: '特种车辆识别',
    isNew: true,
    category: '通用',
    hardware: '昆仑芯R200',
    desc: '支持救护车、消防车、渣土车、搅拌车、油...',
    date: '2026-05-28',
    image: 'https://dummyimage.com/300x160/3b82f6/fff.png&text=Special+Vehicle'
  },
  {
    id: 5,
    title: '烟雾',
    isNew: true,
    category: '通用',
    hardware: '昆仑芯R200',
    desc: '识别监控区域内的烟雾情况，可区分云、扬...',
    date: '2026-05-27',
    image: 'https://dummyimage.com/300x160/3b82f6/fff.png&text=Smoke'
  },
  {
    id: 6,
    title: '连锁门店表盘指针读数',
    isNew: true,
    isLargeModel: true,
    category: '连锁',
    hardware: '英伟达A100',
    desc: '实时监测门店设备仪表数据，当读取到仪表...',
    date: '2026-05-27',
    image: 'https://dummyimage.com/300x160/3b82f6/fff.png&text=Dial+Reading'
  },
  {
    id: 7,
    title: '餐饮门店地面垃圾散落未清扫',
    isLargeModel: true,
    category: '餐饮',
    hardware: '英伟达A100',
    desc: '识别餐饮门店地面垃圾散落情况，可区分...',
    date: '2026-05-27',
    image: 'https://dummyimage.com/300x160/3b82f6/fff.png&text=Trash'
  },
  {
    id: 8,
    title: '人流量统计',
    isNew: true,
    category: '通用',
    hardware: '昆仑芯R200',
    desc: '统计画面中的人流量，可用于商场、景区...',
    date: '2026-05-26',
    image: 'https://dummyimage.com/300x160/3b82f6/fff.png&text=People+Counting'
  },
  {
    id: 9,
    title: '叉车与人员距离',
    isNew: true,
    category: '工厂',
    hardware: '昆仑芯R200',
    desc: '实时监测叉车与人员的距离，当距离过近...',
    date: '2026-05-26',
    image: 'https://dummyimage.com/300x160/3b82f6/fff.png&text=Forklift'
  },
  {
    id: 10,
    title: '机动车闯入',
    isNew: true,
    category: '通用',
    hardware: '昆仑芯R200',
    desc: '识别机动车闯入非机动车道或禁行区域...',
    date: '2026-05-26',
    image: 'https://dummyimage.com/300x160/3b82f6/fff.png&text=Vehicle+Intrusion'
  }
];

function selectCategory(cat: string) {
  searchForm.category = cat;
}

function selectHardware(hw: string) {
  searchForm.hardware = hw;
}

</script>

<template>
  <div class="official-page skill-store-page">
    <div class="official-page-head" style="position: sticky; top: 0; z-index: 10;">
      <h1 class="official-page-title">技能广场</h1>
      <div class="head-actions" style="display: flex; gap: 12px;">
        <a-button>制作授权文件</a-button>
        <a-button>授权额度管理</a-button>
      </div>
    </div>

    <div class="official-card page-card">
      <div v-if="showBanner" class="announcement-banner">
        <div class="banner-content">
          <span class="i-mdi-bullhorn-outline banner-icon"></span>
          <span>一见 VisionClaw发布，仅需两步免费接入专业视觉能力： ① 向OpenClaw发送安装指令 <a class="banner-link">复制指令 <span class="i-mdi-content-copy"></span></a> ② 创建 API Key <a class="banner-link">去创建 <span class="i-mdi-open-in-new"></span></a></span>
        </div>
        <span class="i-mdi-close banner-close" @click="showBanner = false"></span>
      </div>

      <div class="filter-section">
        <div class="search-row">
          <a-input-search
            v-model:value="searchForm.keyword"
            placeholder="请输入技能名称或ID搜索"
            style="width: 320px"
          >
            <template #addonBefore>
              <a-select default-value="技能筛选" style="width: 100px">
                <a-select-option value="技能筛选">技能筛选</a-select-option>
              </a-select>
            </template>
          </a-input-search>
          <a-checkbox v-model:checked="searchForm.onlyLargeModel" style="margin-left: 16px;">仅展示大模型技能</a-checkbox>
        </div>

        <div class="tag-row">
          <div class="tag-label">技能分类</div>
          <div class="tag-list">
            <div 
              v-for="cat in categories" 
              :key="cat"
              class="tag-item"
              :class="{ active: searchForm.category === cat }"
              @click="selectCategory(cat)"
            >
              {{ cat }}
            </div>
          </div>
        </div>

        <div class="tag-row">
          <div class="tag-label">AI加速硬件</div>
          <div class="tag-list">
            <div 
              v-for="hw in hardwareOptions" 
              :key="hw"
              class="tag-item"
              :class="{ active: searchForm.hardware === hw }"
              @click="selectHardware(hw)"
            >
              {{ hw }}
            </div>
          </div>
        </div>
      </div>

      <div class="list-header">
        <div class="list-count">技能 <span class="count-num">500</span> 个</div>
        <a-select v-model:value="searchForm.sort" style="width: 120px" :bordered="false" class="sort-select">
          <a-select-option value="最近更新">最近更新</a-select-option>
          <a-select-option value="最热门">最热门</a-select-option>
        </a-select>
      </div>

      <div class="skill-grid">
        <div v-for="skill in mockSkills" :key="skill.id" class="skill-card">
          <div class="card-cover">
            <img :src="skill.image" :alt="skill.title" />
            <div v-if="skill.isNew" class="badge-new">NEW</div>
            <div v-if="skill.isLargeModel" class="badge-large-model">
              <span class="i-mdi-star-four-points-outline"></span> 多模态大模型
            </div>
          </div>
          <div class="card-body">
            <h3 class="card-title" :title="skill.title">{{ skill.title }} <span class="i-mdi-information-outline info-icon"></span></h3>
            <div class="card-tags">
              <span class="tag">{{ skill.category }}</span>
              <span class="tag hardware-tag"><span class="i-mdi-memory"></span> {{ skill.hardware }}</span>
            </div>
            <p class="card-desc" :title="skill.desc">{{ skill.desc }}</p>
            <div class="card-footer">
              <span class="provider">百度一见</span>
              <span class="date">{{ skill.date }} 更新</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.skill-store-page {
  width: 100%;
  height: 100vh;
  padding: 0;
  overflow-y: auto;
}

.official-page-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.page-card {
  min-height: calc(100% - 64px);
  padding: 24px;
  background: #fff;
  display: flex;
  flex-direction: column;
}

.announcement-banner {
  background: #e6f4ff;
  border: 1px solid #91caff;
  border-radius: 6px;
  padding: 8px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  color: #1677ff;
}

.banner-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.banner-icon {
  font-size: 18px;
}

.banner-link {
  color: #1677ff;
  cursor: pointer;
  margin: 0 4px;
  display: inline-flex;
  align-items: center;
  gap: 2px;
  
  &:hover {
    text-decoration: underline;
  }
}

.banner-close {
  cursor: pointer;
  color: #8c8c8c;
  &:hover {
    color: #434343;
  }
}

.filter-section {
  margin-bottom: 24px;
}

.search-row {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
}

.tag-row {
  display: flex;
  margin-bottom: 16px;
  
  .tag-label {
    width: 100px;
    color: #86909c;
    line-height: 28px;
    flex-shrink: 0;
  }
  
  .tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 16px;
  }
  
  .tag-item {
    padding: 0 12px;
    line-height: 28px;
    border-radius: 4px;
    cursor: pointer;
    color: #4e5969;
    transition: all 0.2s;
    
    &:hover {
      color: #1677ff;
    }
    
    &.active {
      background: #e6f4ff;
      color: #1677ff;
      font-weight: 500;
    }
  }
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  
  .list-count {
    color: #1d2129;
    font-weight: 500;
    
    .count-num {
      color: #86909c;
      font-weight: normal;
    }
  }
  
  .sort-select {
    :deep(.ant-select-selector) {
      padding-right: 0;
    }
  }
}

.skill-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.skill-card {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
  cursor: pointer;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
}

.card-cover {
  position: relative;
  height: 160px;
  width: 100%;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .badge-new {
    position: absolute;
    top: 8px;
    left: 8px;
    background: #ff7d00;
    color: #fff;
    font-size: 12px;
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: bold;
  }
  
  .badge-large-model {
    position: absolute;
    bottom: 8px;
    left: 8px;
    background: rgba(22, 119, 255, 0.9);
    color: #fff;
    font-size: 12px;
    padding: 4px 8px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    gap: 4px;
  }
}

.card-body {
  padding: 16px;
}

.card-title {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 500;
  color: #1d2129;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  gap: 4px;
  
  .info-icon {
    color: #86909c;
    font-size: 16px;
    cursor: pointer;
  }
}

.card-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  
  .tag {
    background: #f2f3f5;
    color: #4e5969;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    
    &.hardware-tag {
      display: flex;
      align-items: center;
      gap: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 150px;
    }
  }
}

.card-desc {
  color: #86909c;
  font-size: 13px;
  margin: 0 0 16px 0;
  line-height: 1.5;
  height: 40px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  color: #86909c;
  font-size: 12px;
}
</style>
