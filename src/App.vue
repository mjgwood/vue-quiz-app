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

ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
.button {
  border: 0;
  border-radius: 50px;
  padding: 1rem 2rem;
  font-family: -system-ui, sans-serif;
  font-size: 1rem;
  line-height: 1.2;
  color: #fff;
  background-color: #70757d;
  white-space: nowrap;
  text-decoration: none;
  transition: background-color 0.1s;
  cursor: pointer;
  &:hover {
    background-color: #3b3e39;
  }
  &[disabled] {
    background-color: #a9aaac;
    pointer-events: none;
  }
}
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
