<template>
  <div>
    <div v-if="currentQuestionIndex < questions.length" v-bind:key="currentQuestionIndex">
      <h2>{{ questions[currentQuestionIndex].text }}</h2>
      <div class="answers-container">
        <div
          class="answer"
          v-for="(answer, index) in questions[currentQuestionIndex].answers"
          @click="selectAnswer(index)"
          :class="{ 'is-selected': chosenAnswers[currentQuestionIndex] == index}"
          :key="index"
        >{{ answer.text }}</div>
      </div>
      <footer>
        <nav class="nav-container" role="navigation" aria-label="Navigation buttons">
          <button
            @click="nextQuestion();"
            :disabled="chosenAnswers[currentQuestionIndex] == null || currentQuestionIndex >= questions.length"
          >Next</button>
        </nav>
      </footer>
    </div>
    <div
      v-if="currentQuestionIndex >= questions.length"
      v-bind:key="currentQuestionIndex"
      class="quiz-completed"
    >
      <p>{{ calcScore() }} / {{ questions.length }} correct answers</p>
    </div>
  </div>
</template>

<script>
const questions = [
    {
      text: 'Question 1?',
      answers: [
        { text: 'A', correct: true },
        { text: 'B' },
        { text: 'C' },
        { text: 'D' },
      ],
    },
    {
      text: 'Question 2?',
      answers: [
        { text: 'A' },
        { text: 'B', correct: true },
        { text: 'C' },
        { text: 'D' },
      ],
    },
    {
      text: 'Question 3?',
      answers: [
        { text: 'A' },
        { text: 'B' },
        { text: 'C', correct: true },
        { text: 'D' },
      ],
    },
    {
      text: 'Question 4?',
      answers: [
        { text: 'A' },
        { text: 'B' },
        { text: 'C' },
        { text: 'D', correct: true },
      ],
    },
  ],
  chosenAnswers = Array.from(questions.length, () => null);

export default {
  name: 'Quiz',
  data() {
    return {
      questions: questions,
      chosenAnswers: chosenAnswers,
      currentQuestionIndex: 0,
    };
  },
  methods: {
    selectAnswer: function (index) {
      window.Vue.set(this.chosenAnswers, this.currentQuestionIndex, index);
    },
    nextQuestion: function () {
      if (this.currentQuestionIndex < this.questions.length) {
        this.currentQuestionIndex++;
      }
    },
    calcScore: function () {
      let total = 0;

      this.chosenAnswers.forEach((answer, index) => {
        if (
          typeof this.questions[index].answers[this.chosenAnswers[index]] !==
            'undefined' &&
          this.questions[index].answers[this.chosenAnswers[index]].correct
        ) {
          total += 1;
        }
      });

      return total;
    },
  },
};
</script>

<style scoped>
h3 {
  margin: 40px 0 0;
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
.nav-container {
  margin-top: 2rem;
}
</style>
