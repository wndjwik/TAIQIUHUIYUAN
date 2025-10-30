<template>
  <div class="home-container">
    <!-- 数据筛选和设置 -->
    <div class="filter-section">
      <el-row :gutter="20" align="middle">
        <el-col :xs="20" :sm="20" :md="auto">
          <el-radio-group v-model="timeRange" size="small">
            <el-radio-button label="today">今日</el-radio-button>
            <el-radio-button label="week">近7日</el-radio-button>
            <el-radio-button label="month">近30日</el-radio-button>
          </el-radio-group>
        </el-col>
        <el-col :xs="4" :sm="4" :md="auto" class="text-right">
          <el-button 
            type="primary" 
            size="small" 
            @click="showDashboardSettings = true"
            icon="Setting"
          >
            仪表盘设置
          </el-button>
        </el-col>
      </el-row>
    </div>

    <!-- 动态数据卡片 - 根据用户配置显示 -->
    <div class="data-cards">
      <el-row :gutter="20">
        <!-- 充值总额卡片 -->
        <el-col 
          v-if="appStore.dashboardConfig.modules.find(m => m.id === 'totalRecharge')?.enabled"
          :xs="24" 
          :sm="12" 
          :md="8"
        >
          <el-card class="data-card recharge-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <el-icon><Money /></el-icon>
                <span>充值总额</span>
              </div>
            </template>
            <div class="card-content">
              <div class="card-value">¥{{ formatAmount(rechargeTotal) }}</div>
              <div class="card-trend" :class="{ 'positive': rechargeTrend > 0, 'negative': rechargeTrend < 0 }">
                <el-icon v-if="rechargeTrend > 0"><ArrowUp /></el-icon>
                <el-icon v-else><ArrowDown /></el-icon>
                {{ Math.abs(rechargeTrend) }}%
              </div>
            </div>
          </el-card>
        </el-col>
        
        <!-- 消费总额卡片 -->
        <el-col 
          v-if="appStore.dashboardConfig.modules.find(m => m.id === 'totalConsume')?.enabled"
          :xs="24" 
          :sm="12" 
          :md="8"
        >
          <el-card class="data-card consume-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <el-icon><ShoppingCart /></el-icon>
                <span>消费总额</span>
              </div>
            </template>
            <div class="card-content">
              <div class="card-value">¥{{ formatAmount(consumeTotal) }}</div>
              <div class="card-trend" :class="{ 'positive': consumeTrend > 0, 'negative': consumeTrend < 0 }">
                <el-icon v-if="consumeTrend > 0"><ArrowUp /></el-icon>
                <el-icon v-else><ArrowDown /></el-icon>
                {{ Math.abs(consumeTrend) }}%
              </div>
            </div>
          </el-card>
        </el-col>
        
        <!-- 会员数量卡片 -->
        <el-col 
          v-if="appStore.dashboardConfig.modules.find(m => m.id === 'memberCount')?.enabled"
          :xs="24" 
          :sm="12" 
          :md="8"
        >
          <el-card class="data-card member-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <el-icon><User /></el-icon>
                <span>会员数量</span>
              </div>
            </template>
            <div class="card-content">
              <div class="card-value">{{ memberCount }}</div>
              <div class="card-trend" :class="{ 'positive': memberTrend > 0, 'negative': memberTrend < 0 }">
                <el-icon v-if="memberTrend > 0"><ArrowUp /></el-icon>
                <el-icon v-else><ArrowDown /></el-icon>
                {{ Math.abs(memberTrend) }}%
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 趋势图表 - 根据用户配置显示 -->
    <div v-if="appStore.dashboardConfig.modules.find(m => m.id === 'trendChart')?.enabled" class="chart-section">
      <el-card class="chart-card" shadow="hover">
        <template #header>
          <span>收支趋势</span>
        </template>
        <div ref="chartRef" style="height: 300px;"></div>
      </el-card>
    </div>

    <!-- 仪表盘设置弹窗 -->
    <el-dialog 
      v-model="showDashboardSettings" 
      title="自定义仪表盘"
      width="500px"
    >
      <div class="dashboard-settings">
        <h3>显示模块</h3>
        <el-checkbox-group v-model="enabledModules" @change="updateModuleVisibility">
          <el-checkbox label="totalRecharge">充值总额</el-checkbox>
          <el-checkbox label="totalConsume">消费总额</el-checkbox>
          <el-checkbox label="memberCount">会员数量</el-checkbox>
          <el-checkbox label="trendChart">收支趋势图表</el-checkbox>
        </el-checkbox-group>
        
        <h3 class="mt-4">默认时间范围</h3>
        <el-radio-group v-model="defaultTimeRange" @change="updateDefaultTimeRange">
          <el-radio-button label="today">今日</el-radio-button>
          <el-radio-button label="week">近7日</el-radio-button>
          <el-radio-button label="month">近30日</el-radio-button>
        </el-radio-group>
        
        <div class="mt-4 text-gray">
          <small>提示：设置将自动保存并应用</small>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted, computed } from 'vue'
import * as echarts from 'echarts'
import { ArrowUp, ArrowDown, Money, ShoppingCart, User, Setting } from '@element-plus/icons-vue'
import { useAppStore } from '../stores/app'

const appStore = useAppStore()
const timeRange = ref(appStore.dashboardConfig.timeRange || 'week')
const rechargeTotal = ref(0)
const consumeTotal = ref(0)
const rechargeTrend = ref(0)
const consumeTrend = ref(0)
const memberCount = ref(0)
const memberTrend = ref(0)
const chartRef = ref(null)
let chartInstance = null

// 仪表盘设置相关
const showDashboardSettings = ref(false)
const enabledModules = computed({
  get: () => appStore.dashboardConfig.modules
    .filter(module => module.enabled)
    .map(module => module.id),
  set: (val) => {
    // 更新模块显示状态
    const updatedModules = appStore.dashboardConfig.modules.map(module => ({
      ...module,
      enabled: val.includes(module.id)
    }));
    appStore.updateDashboardConfig({ modules: updatedModules });
  }
})
const defaultTimeRange = ref(appStore.dashboardConfig.timeRange || 'week')

// 从后端API获取统计数据
const loadData = async () => {
  try {
    // 这里可以调用后端API获取统计数据
    // 暂时使用模拟数据，以便图表能正常显示
    const now = new Date();
    const dates = [];
    const rechargeData = [];
    const consumeData = [];
    
    // 根据时间范围生成数据
    let days = 7; // 默认7天
    if (timeRange.value === 'today') {
      // 生成今日24小时的数据
      for (let i = 0; i < 24; i++) {
        const hour = String(i).padStart(2, '0');
        dates.push(`${hour}:00`);
        
        // 生成模拟的充值和消费数据
        rechargeData.push(Math.floor(Math.random() * 500) + 200); // 200-700的随机数
        consumeData.push(Math.floor(Math.random() * 400) + 100); // 100-500的随机数
      }
    } else {
      if (timeRange.value === 'month') days = 30;
      
      // 生成日期和模拟数据（非今日情况）
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        
        // 格式化日期
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        dates.push(`${month}-${day}`);
        
        // 生成模拟的充值和消费数据
        rechargeData.push(Math.floor(Math.random() * 1000) + 500); // 500-1500的随机数
        consumeData.push(Math.floor(Math.random() * 800) + 300); // 300-1100的随机数
      }
    }
    
    // 计算总额和趋势
    const rechargeTotalValue = rechargeData.reduce((sum, val) => sum + val, 0);
    const consumeTotalValue = consumeData.reduce((sum, val) => sum + val, 0);
    
    // 生成随机趋势数据
    const rechargeTrendValue = Math.floor(Math.random() * 20) - 10; // -10到10的随机数
    const consumeTrendValue = Math.floor(Math.random() * 20) - 10;
    
    // 生成会员数量和趋势（模拟数据）
    let memberCountValue = 0;
    let memberTrendValue = 0;
    
    if (timeRange.value === 'today') {
      memberCountValue = Math.floor(Math.random() * 50) + 100;
      memberTrendValue = Math.floor(Math.random() * 8) - 1; // -1% 到 7%
    } else if (timeRange.value === 'week') {
      memberCountValue = Math.floor(Math.random() * 100) + 150;
      memberTrendValue = Math.floor(Math.random() * 6) - 1; // -1% 到 5%
    } else if (timeRange.value === 'month') {
      memberCountValue = Math.floor(Math.random() * 200) + 200;
      memberTrendValue = Math.floor(Math.random() * 4) - 1; // -1% 到 3%
    }
    
    const defaultData = {
      recharge: rechargeTotalValue,
      consume: consumeTotalValue,
      rechargeTrend: rechargeTrendValue,
      consumeTrend: consumeTrendValue,
      memberCount: memberCountValue,
      memberTrend: memberTrendValue,
      chartData: {
        dates,
        recharge: rechargeData,
        consume: consumeData
      }
    }
    
    rechargeTotal.value = defaultData.recharge
    consumeTotal.value = defaultData.consume
    rechargeTrend.value = defaultData.rechargeTrend
    consumeTrend.value = defaultData.consumeTrend
    memberCount.value = defaultData.memberCount
    memberTrend.value = defaultData.memberTrend
    
    initChart(defaultData.chartData)
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

const formatAmount = (amount) => {
  return amount.toLocaleString('zh-CN')
}

const initChart = (chartData) => {
  if (!chartRef.value) return
  
  if (chartInstance) {
    chartInstance.dispose()
  }
  
  chartInstance = echarts.init(chartRef.value)
  
  // 根据主题动态设置图表颜色
  const isDark = appStore.isDarkMode;
  const chartColors = {
    recharge: isDark ? '#63B3ED' : '#2E86AB',
    consume: isDark ? '#ED64A6' : '#A23B72',
    text: isDark ? '#e5e7eb' : '#303133',
    grid: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
    axis: isDark ? '#4B5563' : '#dcdfe6',
    split: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
  };
  
  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: isDark ? '#374151' : '#ffffff',
      borderColor: isDark ? '#4B5563' : '#dcdfe6',
      textStyle: {
        color: isDark ? '#e5e7eb' : '#303133'
      },
      formatter: function(params) {
        let result = params[0].name + '<br/>';
        params.forEach(function(item) {
          result += item.marker + item.seriesName + ': ¥' + item.value.toLocaleString() + '<br/>';
        });
        return result;
      }
    },
    legend: {
      data: ['充值', '消费'],
      textStyle: {
        color: chartColors.text
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
      backgroundColor: chartColors.grid
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: chartData.dates,
      axisLine: {
        lineStyle: {
          color: chartColors.axis
        }
      },
      axisLabel: {
        color: chartColors.text
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: function(value) {
          return '¥' + value.toLocaleString();
        },
        color: chartColors.text
      },
      axisLine: {
        lineStyle: {
          color: chartColors.axis
        }
      },
      splitLine: {
        lineStyle: {
          color: chartColors.split
        }
      }
    },
    series: [
      {
        name: '充值',
        type: 'line',
        smooth: true,
        lineStyle: {
          color: chartColors.recharge
        },
        itemStyle: {
          color: chartColors.recharge
        },
        data: chartData.recharge
      },
      {
        name: '消费',
        type: 'line',
        smooth: true,
        lineStyle: {
          color: chartColors.consume
        },
        itemStyle: {
          color: chartColors.consume
        },
        data: chartData.consume
      }
    ]
  }
  
  chartInstance.setOption(option)
}

// 移除不再使用的点击处理函数

// 更新模块显示状态 - 现在由enabledModules的setter处理
const updateModuleVisibility = () => {
  // 这里可以保持为空或者添加额外的处理逻辑
  // 实际的更新已经通过enabledModules的setter处理
}

// 更新默认时间范围
const updateDefaultTimeRange = () => {
  appStore.setDashboardTimeRange(defaultTimeRange.value);
  timeRange.value = defaultTimeRange.value;
};

// 处理窗口大小变化
const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

// 组件挂载时添加事件监听
onMounted(() => {
  loadData()
  window.addEventListener('resize', handleResize)
})

watch(timeRange, loadData)

// 监听主题变化，重新设置图表颜色
watch(() => appStore.isDarkMode, () => {
  if (chartInstance && appStore.dashboardConfig.modules.find(m => m.id === 'trendChart')?.enabled) {
    loadData(); // 重新加载数据以更新图表颜色
  }
})

// 组件卸载时销毁图表和移除事件监听
onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose()
  }
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.home-container {
  padding: 20px 0;
}

.filter-section {
  margin-bottom: 20px;
  background: #fff;
  padding: 15px;
  border-radius: 8px;
}

.data-cards {
  margin-bottom: 20px;
}

.data-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.recharge-card {
  border-left: 4px solid #2E86AB;
}

.consume-card {
  border-left: 4px solid #A23B72;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #333;
}

.card-value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin: 10px 0;
}

.card-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
}

.card-trend.positive {
  color: #f56c6c;
}

.card-trend.negative {
  color: #67c23a;
}

.chart-section {
  margin-bottom: 20px;
}

.chart-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

/* 会员卡片样式 */
.member-card {
  border-left: 4px solid #67C23A;
}

/* 深色模式下的样式适配 */
:global(#app.dark-mode) .filter-section {
  background: #1f2937;
  border: 1px solid #374151;
}

:global(#app.dark-mode) .data-card {
  background-color: #1f2937;
  border-color: #374151;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

:global(#app.dark-mode) .chart-card {
  background-color: #1f2937;
  border-color: #374151;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

:global(#app.dark-mode) .card-header {
  color: #e5e7eb;
}

:global(#app.dark-mode) .card-header span {
  color: #e5e7eb;
}

:global(#app.dark-mode) .card-value {
  color: #ffffff;
}

:global(#app.dark-mode) .chart-card .el-card__header {
  border-bottom-color: #374151;
}

:global(#app.dark-mode) .chart-card .el-card__header span {
  color: #e5e7eb;
}

/* 仪表盘设置样式 */
.dashboard-settings h3 {
  font-size: 16px;
  margin-bottom: 10px;
  color: inherit;
}

.mt-4 {
  margin-top: 16px;
}

.text-gray {
  color: #606266;
}

/* 响应式设计优化 */
@media (max-width: 768px) {
  .home-container {
    padding: 10px 0;
  }
  
  .filter-section {
    padding: 10px;
    margin-bottom: 15px;
  }
  
  .data-cards {
    margin-bottom: 15px;
  }
  
  .card-value {
    font-size: 20px;
  }
  
  .chart-card {
    margin-bottom: 15px;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .card-value {
    font-size: 22px;
  }
}

/* 卡片交互效果 */
.data-card {
  transition: all 0.3s ease;
  cursor: default;
}

.data-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

:global(#app.dark-mode) .data-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

/* quick-actions样式已移除 */
</style>