<template>
  <div class="records-container">
    <h1>消费记录</h1>
    
    <!-- 搜索区域 -->
    <div class="search-area">
      <el-input
        v-model="searchQuery"
        placeholder="请输入会员姓名或手机号"
        :prefix-icon="Search"
        style="width: 300px; margin-bottom: 16px;"
        @keyup.enter="handleSearch"
      />
      <el-button 
        type="primary" 
        @click="handleSearch"
        :icon="Search"
        class="search-button"
      >搜索</el-button>
    </div>
    
    <!-- 表格 -->
    <el-table :data="consumeRecords" stripe style="width: 100%" :loading="loading">
      <el-table-column prop="memberId" label="会员编号" width="120" />
      <el-table-column prop="name" label="会员姓名" width="120" />
      <el-table-column prop="amount" label="消费金额" width="120">
        <template #default="scope">
          ¥{{ formatAmount(scope.row.amount) }}
        </template>
      </el-table-column>
      <el-table-column prop="time" label="消费时间" width="180" />
      <el-table-column prop="operator" label="操作员" width="120" />
    </el-table>
    
    <!-- 分页 -->
    <div class="pagination" v-if="total > 0">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { consumeAPI } from '../services/api.js'
import { consumeIPC, checkEnvironment } from '../services/ipc-api.js'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'

// 智能API选择器
const useAPI = () => {
  const env = checkEnvironment();
  return env.isElectron && env.hasElectronAPI ? consumeIPC : consumeAPI;
};

const consumeApi = useAPI();

export default {
  name: 'ConsumeRecords',
  components: {
    Search
  },
  setup() {
    const consumeRecords = ref([])
    const loading = ref(false)
    const searchQuery = ref('')
    const currentPage = ref(1)
    const pageSize = ref(20)
    const total = ref(0)

    const loadConsumeRecords = async (page = 1, size = 20, search = '') => {
      try {
        loading.value = true
        const response = await consumeApi.getConsumeRecords({
          page,
          pageSize: size,
          search
        })
        consumeRecords.value = response.data.records.map(record => ({
          memberId: record.member_id,
          name: record.member_name,
          amount: parseFloat(record.amount),
          time: record.createdAt,
          operator: record.operator
        }))
        total.value = response.data.total
      } catch (error) {
        ElMessage.error('加载消费记录失败: ' + error.message)
      } finally {
        loading.value = false
      }
    }
    
    // 搜索处理
    const handleSearch = () => {
      currentPage.value = 1
      loadConsumeRecords(1, pageSize.value, searchQuery.value)
    }
    
    // 页码改变
    const handleCurrentChange = (val) => {
      currentPage.value = val
      loadConsumeRecords(val, pageSize.value, searchQuery.value)
    }
    
    // 每页大小改变
    const handleSizeChange = (val) => {
      pageSize.value = val
      currentPage.value = 1
      loadConsumeRecords(1, val, searchQuery.value)
    }

    const formatAmount = (amount) => {
      return amount.toLocaleString('zh-CN')
    }

    onMounted(() => {
      loadConsumeRecords()
    })

    return {
      consumeRecords,
      formatAmount,
      loading,
      searchQuery,
      currentPage,
      pageSize,
      total,
      handleSearch,
      handleCurrentChange,
      handleSizeChange
    }
  }
};
</script>

<style scoped>
.records-container {
  padding: 20px;
}

.search-area {
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  /* 确保输入框和按钮在垂直方向完美对齐 */
  .el-input {
    margin-bottom: 0 !important;
  }

/* 搜索按钮样式 */
.search-button {
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.search-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.pagination {
  margin-top: 20px;
  text-align: right;
}
</style>