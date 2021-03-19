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

html {
  line-height: 1.5;
}
h1 {
  font-size: 3em;
  font-style: italic;
}
h2 {
  font-size: 1.75rem;
}
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
  min-width: 140px;
  padding: 1.25rem 2rem;
  font-family: -system-ui, sans-serif;
  font-size: 1.125rem;
  line-height: 1.2;
  color: #313030;
  background-color: $btn-bg;
  border: 0;
  border-radius: 1px;
  white-space: nowrap;
  text-decoration: none;
  text-transform: capitalize;
  transition: all 0.1s;
  cursor: pointer;
  &:hover {
    color: #fff;
    background-color: $btn-hover;
  }
  &[disabled] {
    color: #313030;
    background-color: #a9aaac;
    pointer-events: none;
  }
}
#app {
  display: flex;
  align-items: center;
  min-height: calc(100vh - 80px);
  padding: 2.5rem 0.625rem;
  text-align: center;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  color: #fff;
  background-color: #0e1324;
  letter-spacing: 0.5px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
