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

body {
  background-color: #2c3e50;
}
#app {
  display: flex;
  text-align: center;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
