<script setup>
import { storeToRefs } from 'pinia'
import { useTaskStore } from '@/stores/taskStore'
import { useRouter } from 'vue-router' // 引入路由
import { useNotification } from '@/composables/useNotification'
import TaskHeader from '@/components/TaskHeader.vue'
import TaskInput from '@/components/TaskInput.vue'
import TaskFilter from '@/components/TaskFilter.vue'
import TaskItem from '@/components/TaskItem.vue'

const taskStore = useTaskStore()
const router = useRouter()
const { filter, filteredTasks } = storeToRefs(taskStore)
const { addTask, removeTask, toggleTask } = taskStore

// 消息提示交给 useNotification 组合式函数统一管理
const { message, isVisible, notify } = useNotification()

// 新增任务：写入 store 后给出提示
const handleAdd = (title) => {
  addTask(title)
  notify(`已添加：${title}`)
}

// 切换完成状态：先取原对象（toggleTask 会原地修改它），再提示新状态
const handleToggle = (id) => {
  const target = taskStore.tasks.find(t => t.id === id)
  toggleTask(id)
  if (target) notify(target.isCompleted ? '任务已完成' : '已取消完成')
}

// 删除任务
const handleRemove = (id) => {
  removeTask(id)
  notify('已删除任务')
}

// 退出登录方法
const handleLogout = () => {
  localStorage.removeItem('isLoggedIn')
  router.push('/login')
}
</script>

<template>
  <div class="py-12 px-4">
    <div class="max-w-md mx-auto bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
      <TaskHeader />
      <main class="p-6">
        <TaskInput @add-task="handleAdd" />
        <TaskFilter v-model="filter" />
        
        <ul class="space-y-3">
          <TransitionGroup name="list">
            <TaskItem 
              v-for="task in filteredTasks" 
              :key="task.id"
              :task="task"
              @toggle="handleToggle"
              @remove="handleRemove"
            />
          </TransitionGroup>
        </ul>

        <button 
          @click="handleLogout"
          class="mt-8 w-full py-2 text-xs text-slate-400 hover:text-red-500 transition-colors"
        >
          退出当前账号
        </button>
      </main>
    </div>

    <!-- 消息提示出口 -->
    <Transition name="toast">
      <div
        v-if="isVisible"
        class="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-slate-900/90 text-white text-sm shadow-lg"
      >
        {{ message }}
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* 提示条的淡入淡出 */
.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.2s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
}
</style>