<template>
  <div id="app">
    <Quiz class="quiz-container" />
  </div>
</template>

<script>
import Quiz from './components/Quiz.vue';

export default {
  name: 'App',
  components: {
    Quiz,
  },
};
</script>

<style lang="scss">
@import 'normalize-scss';
@include normalize();

#app {
  display: flex;
  align-items: center;
  min-height: calc(100vh - 80px);
  padding: 40px 10px;
  text-align: center;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  background-color: #0e1824;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
