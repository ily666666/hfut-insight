<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useAlarmStore } from '@/stores/alarm';
import AlarmCard from './AlarmCard.vue';

const router = useRouter();
const store = useAlarmStore();
const { displayList, unreadOnly } = storeToRefs(store);

onMounted(() => {
  store.loadRealtime();
});

function openAlarmRecord() {
  router.push({ name: 'AlarmRecord' }).catch(() => {});
}
</script>

<template>
  <aside class="alarm-panel">
    <div class="header">
      <span class="title">实时预警</span>
      <label class="unread-checkbox">
        <input v-model="unreadOnly" type="checkbox" />
        <span class="checkbox-square" />
        <span class="checkbox-text">未查阅</span>
      </label>
    </div>

    <div class="list">
      <AlarmCard
        v-for="alarm in displayList"
        :key="alarm.id"
        :alarm="alarm"
        @click="store.markRead(alarm.id)"
      />
      <div v-if="!displayList.length" class="empty">暂无预警</div>
    </div>

    <div class="footer">
      <button type="button" class="more" @click="openAlarmRecord">查看更多</button>
    </div>
  </aside>
</template>

<style lang="scss" scoped>
.alarm-panel {
  flex: 0 0 176px;
  width: 176px;
  background: $bg-white;
  border-radius: $radius-md;
  border: 1px solid $divider;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  @media (max-width: 1280px) {
    flex: 0 0 168px;
    width: 168px;
  }
}

.header {
  padding: 12px 14px 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: $text-primary;
  font-size: 14px;
  font-weight: 600;
}

.unread-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 400;
  color: $text-regular;
  cursor: pointer;
  user-select: none;

  input {
    display: none;
  }
}

.checkbox-square {
  width: 14px;
  height: 14px;
  border: 1px solid $divider-strong;
  border-radius: 3px;
  display: inline-block;
  position: relative;
  background: #fff;
}

input:checked + .checkbox-square {
  background: $brand-blue;
  border-color: $brand-blue;

  &::after {
    content: '';
    position: absolute;
    left: 3px;
    top: 0;
    width: 5px;
    height: 9px;
    border: solid #fff;
    border-width: 0 1.5px 1.5px 0;
    transform: rotate(45deg);
  }
}

.list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.empty {
  color: $text-placeholder;
  font-size: 12px;
  text-align: center;
  padding: 40px 0;
}

.footer {
  flex: 0 0 auto;
  border-top: 1px solid $divider;
  padding: 8px 14px;
  text-align: right;
}

.more {
  border: 0;
  padding: 0;
  background: none;
  cursor: pointer;
  color: $text-regular;
  font-size: 12px;
  transition: color 0.12s;

  &:hover {
    color: $brand-blue;
  }

  &::after {
    content: '›';
    margin-left: 4px;
  }
}
</style>
