<template>
  <div class="employees-container">
      <el-card class="box-card">
        <template #header>
          <div class="card-header">
            <span>员工管理</span>
            <el-button type="primary" @click="showAddEmployeeDialog">新增员工</el-button>
          </div>
        </template>

      <!-- 搜索框 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="员工编号">
          <el-input v-model="searchForm.employee_id" placeholder="请输入员工编号"></el-input>
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="searchForm.name" placeholder="请输入姓名"></el-input>
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="searchForm.phone" placeholder="请输入手机号"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="search">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 员工列表 -->
      <el-table :data="employeesData" stripe style="width: 100%">
        <el-table-column prop="employee_id" label="员工编号" width="120"></el-table-column>
        <el-table-column prop="name" label="姓名" width="120"></el-table-column>
        <el-table-column prop="phone" label="手机号" width="150"></el-table-column>
        <el-table-column prop="role" label="权限" width="120">
          <template #default="scope">
            <el-tag :type="getRoleType(scope.row.role)">{{ getRoleText(scope.row.role) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
              {{ scope.row.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="注册时间" width="180"></el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="scope">
            <el-dropdown>
              <el-button size="small">
                操作 <i class="el-icon-arrow-down el-icon--right"></i>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="editEmployee(scope.row)">
                    <i class="el-icon-edit"></i> 编辑
                  </el-dropdown-item>
                  <el-dropdown-item @click="changeEmployeePassword(scope.row)">
                    <i class="el-icon-key"></i> 修改密码
                  </el-dropdown-item>
                  <el-dropdown-item 
                    @click="toggleEmployeeStatus(scope.row)"
                    :type="scope.row.status === 'active' ? 'danger' : 'success'"
                  >
                    <i :class="scope.row.status === 'active' ? 'el-icon-delete' : 'el-icon-circle-check'"></i>
                    {{ scope.row.status === 'active' ? '禁用' : '启用' }}
                  </el-dropdown-item>
                  <el-dropdown-item 
                    @click="deleteEmployee(scope.row)"
                    type="danger"
                    divided
                  >
                    <i class="el-icon-delete"></i> 删除
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑员工对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form ref="employeeFormRef" :model="employeeForm" :rules="employeeRules" label-width="120px">
        <el-form-item label="员工编号" v-if="dialogMode === 'edit'" prop="employee_id">
          <el-input v-model="employeeForm.employee_id" disabled></el-input>
        </el-form-item>
        <el-form-item label="员工编号" v-else>
          <el-input v-model="employeeForm.employee_id" disabled placeholder="系统自动生成"></el-input>
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="employeeForm.name" placeholder="请输入姓名"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="employeeForm.phone" placeholder="请输入手机号"></el-input>
        </el-form-item>
        <el-form-item label="密码" v-if="dialogMode === 'add'" prop="password">
          <el-input v-model="employeeForm.password" type="password" placeholder="密码长度不少于6位，只能包含字母和数字"></el-input>
        </el-form-item>
        <el-form-item label="确认密码" v-if="dialogMode === 'add'" prop="confirmPassword">
          <el-input v-model="employeeForm.confirmPassword" type="password" placeholder="请确认密码"></el-input>
        </el-form-item>
        <el-form-item label="权限" prop="role">
          <el-radio-group v-model="employeeForm.role">
            <el-radio value="admin">管理员</el-radio>
            <el-radio value="employee">员工</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="状态" prop="status" v-if="dialogMode === 'edit'">
          <el-switch v-model="employeeForm.status" active-value="active" inactive-value="inactive"></el-switch>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitEmployeeForm">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 修改密码对话框 -->
    <el-dialog v-model="passwordDialogVisible" title="修改密码" width="400px">
      <el-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" label-width="120px">
        <el-form-item label="原密码" prop="oldPassword">
          <el-input v-model="passwordForm.oldPassword" type="password" placeholder="请输入原密码"></el-input>
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" placeholder="密码长度不少于6位，只能包含字母和数字"></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" placeholder="请确认新密码"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="passwordDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitPasswordForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { api } from '@/services/api.js'
// 暂时移除getUserInfo导入

export default {
  name: 'Employees',
  setup() {
    // 表单引用
    const employeeFormRef = ref(null);
    const passwordFormRef = ref(null);
    
    // 状态管理
    const employees = ref([]);
    const loading = ref(false);
    const dialogVisible = ref(false);
    const passwordDialogVisible = ref(false);
    const dialogMode = ref('add'); // 'add' 或 'edit'
    const currentEmployeeId = ref(null);
    const dialogTitle = ref(''); // 对话框标题
    
    // 暂时移除权限相关计算属性
    
    // 搜索表单
    const searchForm = reactive({
      employee_id: '',
      name: '',
      phone: ''
    });
    
    // 分页数据
    const pagination = reactive({
      currentPage: 1,
      pageSize: 10,
      total: 0
    });
    
    // 员工表单
    const employeeForm = reactive({
      employee_id: '',
      name: '',
      phone: '',
      password: '',
      confirmPassword: '',
      role: 'employee',
      status: 'active'
    });
    
    // 密码表单
    const passwordForm = reactive({
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    
    // 表单验证规则
    const employeeRules = reactive({
      employee_id: [
        { required: () => dialogMode.value === 'edit', message: '请输入员工编号', trigger: 'blur' }
      ],
      name: [
        { required: true, message: '请输入姓名', trigger: 'blur' }
      ],
      phone: [
        { required: true, message: '请输入手机号', trigger: 'blur' },
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
      ],
      password: [
        { required: () => dialogMode.value === 'add', message: '请输入密码', trigger: 'blur' },
        { min: 6, message: '密码长度不能少于6位', trigger: 'blur' },
        { pattern: /^[A-Za-z0-9]+$/, message: '密码只能包含字母和数字', trigger: 'blur' }
      ],
      confirmPassword: [
        { required: () => dialogMode.value === 'add', message: '请确认密码', trigger: 'blur' },
        {
          validator: (rule, value, callback) => {
            if (value !== employeeForm.password) {
              callback(new Error('两次输入的密码不一致'));
            } else {
              callback();
            }
          },
          trigger: 'blur'
        }
      ]
    });
    
    const passwordRules = {
      oldPassword: [
        { required: true, message: '请输入原密码', trigger: 'blur' }
      ],
      newPassword: [
        { required: true, message: '请输入新密码', trigger: 'blur' },
        { min: 6, message: '密码长度不能少于6位', trigger: 'blur' },
        { pattern: /^[A-Za-z0-9]+$/, message: '密码只能包含字母和数字', trigger: 'blur' }
      ],
      confirmPassword: [
        { required: true, message: '请确认新密码', trigger: 'blur' },
        {
          validator: (rule, value, callback) => {
            if (value !== passwordForm.newPassword) {
              callback(new Error('两次输入的密码不一致'));
            } else {
              callback();
            }
          },
          trigger: 'blur'
        }
      ]
    };
    
    // 计算属性：过滤后的员工数据
    const employeesData = computed(() => {
      // 确保employees.value是数组，避免undefined导致的length错误
      let filtered = Array.isArray(employees.value) ? employees.value : [];
      
      // 根据搜索条件过滤
      if (searchForm.employee_id) {
        filtered = filtered.filter(item => item.employee_id && item.employee_id.includes(searchForm.employee_id));
      }
      if (searchForm.name) {
        filtered = filtered.filter(item => item.name && item.name.includes(searchForm.name));
      }
      if (searchForm.phone) {
        filtered = filtered.filter(item => item.phone && item.phone.includes(searchForm.phone));
      }
      
      // 更新总数
      pagination.total = filtered.length;
      
      // 分页
      const start = (pagination.currentPage - 1) * pagination.pageSize;
      const end = start + pagination.pageSize;
      return filtered.slice(start, end);
    });
    
    // 获取员工列表
    const fetchEmployees = async () => {
      console.log('fetchEmployees函数被调用');
      loading.value = true;
      try {
        // 构建查询参数对象
        const queryData = {
          page: pagination.currentPage,
          pageSize: pagination.pageSize
        };
        console.log('构建的查询参数:', queryData);
        
        // 只添加非空的搜索条件
        Object.keys(searchForm).forEach(key => {
          if (searchForm[key]) {
            queryData[key] = searchForm[key];
          }
        });
        
        console.log('准备获取员工列表');
        // 使用API封装获取员工列表
        const data = await api.getAllEmployees(queryData);
        
        console.log('收到API响应:', data);
        // 检查响应数据是否存在
          if (data && data.success) {
            console.log('获取员工列表成功:', data.data);
            // 检查data是否存在且为数组
            const resultData = data.data || [];
            employees.value = Array.isArray(resultData) ? resultData : [];
            console.log('解析后的员工数据:', employees.value);
            pagination.total = data.total || employees.value.length;
          } else {
            console.error('获取员工列表失败:', data?.message || '未知错误');
            ElMessage.error(data?.message || '获取员工列表失败');
            employees.value = [];
            pagination.total = 0;
          }
      } catch (error) {
        console.error('获取员工列表失败:', error);
        ElMessage.error(`获取员工列表失败：${error.message || '未知错误'}`);
        // 错误时确保employees是数组，避免后续渲染错误
        employees.value = [];
        pagination.total = 0;
      } finally {
        loading.value = false;
      }
    };
    
    // 搜索
    const search = () => {
      pagination.currentPage = 1; // 重置为第一页
    };
    
    // 重置搜索
    const resetSearch = () => {
      searchForm.employee_id = '';
      searchForm.name = '';
      searchForm.phone = '';
      pagination.currentPage = 1;
    };
    
    // 分页处理
    const handleSizeChange = (size) => {
      pagination.pageSize = size;
    };
    
    const handleCurrentChange = (current) => {
      pagination.currentPage = current;
    };
    
    // 显示新增员工对话框
    const showAddEmployeeDialog = () => {
      dialogMode.value = 'add';
      dialogTitle.value = '新增员工';
      
      // 重置表单
      Object.assign(employeeForm, {
        employee_id: '', // 留空，由后端自动生成
        name: '',
        phone: '',
        password: '',
        confirmPassword: '',
        role: 'employee',
        status: 'active'
      });
      
      dialogVisible.value = true;
    };
    
    // 编辑员工
    const editEmployee = (row) => {
      dialogMode.value = 'edit';
      dialogTitle.value = '编辑员工';
      currentEmployeeId.value = row.employee_id;
      
      // 填充表单数据
      Object.assign(employeeForm, {
        employee_id: row.employee_id,
        name: row.name,
        phone: row.phone,
        role: row.role,
        status: row.status
      });
      
      dialogVisible.value = true;
    };
    
    // 修改员工密码
    const changeEmployeePassword = (row) => {
      currentEmployeeId.value = row.employee_id;
      
      // 重置密码表单
      Object.assign(passwordForm, {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      passwordDialogVisible.value = true;
    };
    
    // 删除员工
    const deleteEmployee = async (row) => {
      try {
        // 显示确认对话框
        const confirmResult = await ElMessageBox.confirm(
          `确定要删除员工「${row.name}」吗？此操作不可撤销！`,
          '删除确认',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        );

        if (confirmResult === 'confirm') {
          // 调用API删除员工
          const data = await api.deleteEmployee(row.employee_id);
          
          if (data && data.success) {
            ElMessage.success('删除员工成功');
            // 重新获取员工列表
            fetchEmployees();
          } else {
            ElMessage.error(data?.message || '删除失败');
          }
        }
      } catch (error) {
        // 检查是否是用户取消操作
        if (error === 'cancel') {
          return;
        }
        console.error('删除员工失败:', error);
        ElMessage.error(`删除失败：${error.message || '未知错误'}`);
      }
    };

    // 切换员工状态
    const toggleEmployeeStatus = async (row) => {
      try {
        const newStatus = row.status === 'active' ? 'inactive' : 'active';
        const data = await api.updateEmployee(row.employee_id, { status: newStatus });
        
        row.status = newStatus;
        ElMessage.success(`${row.status === 'active' ? '启用' : '禁用'}成功`);
      } catch (error) {
        ElMessage.error(`${row.status === 'active' ? '禁用' : '启用'}失败：` + error.message);
      }
    };
    
    // 提交员工表单
    const submitEmployeeForm = async () => {
      if (employeeFormRef.value && employeeFormRef.value.validate) {
        employeeFormRef.value.validate(async (valid) => {
          if (valid) {
            try {
              console.log('提交员工表单数据:', employeeForm);
              let data;
              
              if (dialogMode.value === 'add') {
                // 新增 - 移除不需要的字段，确保必填字段存在
                const { employee_id, confirmPassword, ...employeeData } = employeeForm;
                
                // 确保角色字段存在且有效
                if (!employeeData.role || !['admin', 'employee'].includes(employeeData.role)) {
                  employeeData.role = 'employee';
                }
                
                // 确保状态字段存在
                employeeData.status = 'active';
                
                console.log('处理后的提交数据:', employeeData);
                
                data = await api.createEmployee(employeeData);
              } else {
                // 编辑
                data = await api.updateEmployee(currentEmployeeId.value, employeeForm);
              }
              
              // 检查响应数据是否存在
              if (!data) {
                throw new Error('未收到响应数据');
              }
              
              // 检查操作是否成功
              if (data.success) {
                ElMessage.success(data.message || '操作成功');
                dialogVisible.value = false;
                fetchEmployees(); // 重新获取列表
              } else {
                // 操作失败，显示后端返回的错误信息
                console.error('后端返回错误:', data);
                ElMessage.error(data.message || '操作失败');
              }
            } catch (error) {
              // 详细日志记录错误信息
              console.error('提交员工表单异常:', error);
              ElMessage.error(`操作异常: ${error.message || '未知错误'}`);
            }
          }
        });
      }
    };
    
    // 提交密码表单
    const submitPasswordForm = async () => {
      if (passwordFormRef.value && passwordFormRef.value.validate) {
        passwordFormRef.value.validate(async (valid) => {
          if (valid) {
            try {
              const data = await api.changePassword(currentEmployeeId.value, passwordForm);
              
              ElMessage.success(data.message);
              passwordDialogVisible.value = false;
            } catch (error) {
              ElMessage.error('修改密码失败：' + error.message);
            }
          }
        });
      }
    };
    
    // 获取角色标签类型
    const getRoleType = (role) => {
      switch (role) {
        case 'admin':
          return 'danger';
        case 'employee':
          return 'success';
        default:
          return 'info';
      }
    };
    
    // 获取角色文本
    const getRoleText = (role) => {
      switch (role) {
        case 'admin':
          return '管理员';
        case 'employee':
          return '员工';
        default:
          return role;
      }
    };
    

    
    // 初始化
    onMounted(() => {
      console.log('===== Employees组件已挂载 =====');
      console.log('当前路由路径:', window.location.pathname);
      console.log('即将调用fetchEmployees函数');
      fetchEmployees();
    });
    
    return {
      employees,
      loading,
      searchForm,
      pagination,
      employeesData,
      dialogVisible,
      passwordDialogVisible,
      dialogMode,
      dialogTitle,
      employeeForm,
      passwordForm,
      employeeRules,
      passwordRules,
      employeeFormRef,
      passwordFormRef,
      search,
      resetSearch,
      handleSizeChange,
      handleCurrentChange,
      showAddEmployeeDialog,
      editEmployee,
      changeEmployeePassword,
      toggleEmployeeStatus,
      deleteEmployee,
      submitEmployeeForm,
      submitPasswordForm,
      getRoleType,
      getRoleText
    };
  }
};
</script>

<style scoped>
.employees-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>