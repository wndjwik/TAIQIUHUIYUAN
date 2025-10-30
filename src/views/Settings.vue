<template>
  <div class="settings-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>系统设置</span>
        </div>
      </template>
      
      <div class="empty-settings">
        <el-empty description="暂无设置选项"></el-empty>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ElEmpty } from 'element-plus'
</script>

<style scoped>
.settings-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.empty-settings {
  padding: 40px 0;
  text-align: center;
}
</style>