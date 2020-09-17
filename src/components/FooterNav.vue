<template>
  <footer>
    <nav class="nav-container" role="navigation" aria-label="Navigation buttons">
      <button
        class="button"
        type="button"
        @click="prevQuestion();"
        :disabled="currentQuestionIndex < 1"
      >Back</button>
      <button
        class="button button--next"
        type="button"
        @click="nextQuestion();"
        :disabled="chosenAnswers[currentQuestionIndex] == null || currentQuestionIndex >= questions.length"
      >{{ currentQuestionIndex == questions.length - 1 ? 'Submit' : 'Next' }}</button>
      <ul class="nav-steps">
        <li
          class="nav-step"
          v-for="(question, index) in questions"
          :key="index"
          @click="selectQuestion(index)"
        >
          <button
            class="button"
            type="button"
            :disabled="chosenAnswers.length < index"
            :class="{'is-active': currentQuestionIndex == index}"
          >{{ index + 1 }}</button>
        </li>
      </ul>
    </nav>
  </footer>
</template>

<script>
export default {
  name: 'FooterNav',
  props: {
    questions: Array,
    chosenAnswers: Array,
    currentQuestionIndex: Number,
  },
  methods: {
    // Decrement currentQuestionIndex
    prevQuestion() {
      if (this.questions.length > 0 && this.currentQuestionIndex > 0) {
        this.$emit('update-question-index', this.currentQuestionIndex - 1);
      }
    },
    // Increment currentQuestionIndex
    nextQuestion() {
      if (this.currentQuestionIndex < this.questions.length) {
        this.$emit('update-question-index', this.currentQuestionIndex + 1);
      }
    },
    // Update currentQuestionIndex to given index
    selectQuestion(index) {
      if (this.chosenAnswers.length >= index) {
        this.$emit('update-question-index', index);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.button {
  &--next {
    color: #fff;
    background-color: $btn-bg--active;
    &:hover {
      background-color: $btn-hover;
    }
  }
}
.nav-container {
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  margin-top: 3rem;
  .nav-steps {
    flex: 1 0 100%;
    margin-top: 2rem;
    .nav-step {
      margin: 10px 6px;
    }
    .button {
      width: 3rem;
      height: 3rem;
      min-width: auto;
      padding: 0;
    }
    .is-active {
      color: #fff;
      background-color: $btn-bg--active;
    }
  }
}
</style>