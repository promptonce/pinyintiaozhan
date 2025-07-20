<template>
  <div class="app-container">
    <div class="container">
      <h1>专业拼音练习工具 v3.0</h1>
      
      <PracticeArea />
      <ManagementArea />
    </div>
  </div>
</template>

<script setup>
import PracticeArea from './components/PracticeArea.vue'
import ManagementArea from './components/ManagementArea.vue'
</script>

<style>
/* 导入全局样式 */
@import './styles/global.css';

.app-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  padding: 20px;
  margin: 0;
  box-sizing: border-box;
}

.container {
  width: 100%;
  max-width: 600px;
  background-color: #fff;
  padding: 25px 30px;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
}

h1 {
  text-align: center;
  color: var(--primary-color);
  margin-bottom: 25px;
}
</style>