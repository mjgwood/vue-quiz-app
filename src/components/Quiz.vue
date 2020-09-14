<template>
  <div>
    <div v-if="questions.length == 0">Loading...</div>
    <div
      class="quiz"
      v-else-if="currentQuestionIndex < questions.length"
      v-bind:key="currentQuestionIndex"
    >
      <h2>{{ questions[currentQuestionIndex].text | decodeHtml }}</h2>
      <div class="answers-container">
        <div
          class="answer"
          v-for="(answer, index) in questions[currentQuestionIndex].answers"
          @click="selectAnswer(index)"
          :class="{ 'is-selected': chosenAnswers[currentQuestionIndex] == index}"
          :key="index"
        >{{ answer.text | decodeHtml }}</div>
      </div>
      <footer>
        <nav class="nav-container" role="navigation" aria-label="Navigation buttons">
          <button type="button" @click="prevQuestion();" :disabled="currentQuestionIndex < 1">Back</button>
          <button
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
                type="button"
                :disabled="chosenAnswers.length < index"
                :class="{'is-active': currentQuestionIndex == index}"
              >{{ index + 1 }}</button>
            </li>
          </ul>
        </nav>
      </footer>
    </div>
    <div
      v-else-if="currentQuestionIndex >= questions.length"
      v-bind:key="currentQuestionIndex"
      class="quiz-completed"
    >
      <h2>{{ completionMessage() }}</h2>
      <p>{{ calcScore() }} / {{ questions.length }} correct answers</p>
      <button type="button" @click="restartQuiz()">Restart Quiz</button>
    </div>
  </div>
</template>

<script>
const questions = [],
  chosenAnswers = [];

import axios from 'axios';

export default {
  name: 'Quiz',
  data() {
    return {
      questions: questions,
      chosenAnswers: chosenAnswers,
      currentQuestionIndex: 0,
    };
  },
  mounted() {
    const url = 'https://opentdb.com/api.php?amount=5&category=9';
    axios
      .get(url)
      .then((response) => {
        // If results not returned successfully
        if (response.data.response_code != 0) {
          return Promise.reject(response);
        }

        this.populateQuestions(response.data.results);
      })
      .catch((error) => {
        console.log(error);
        alert(
          'Sorry, something went wrong trying to load the questions. Please try again.'
        );
      });
  },
  methods: {
    populateQuestions(responseJson) {
      if (responseJson.length > 0) {
        responseJson.forEach((questionData) => {
          const newQuestion = {};
          const answers = [];

          [
            ...questionData.incorrect_answers,
            questionData.correct_answer,
          ].forEach((answer) => {
            let answerObject = { text: '', correct: false };

            [answerObject.text, answerObject.correct] = [
              answer,
              answer == questionData.correct_answer,
            ];

            answers.push(answerObject);
          });

          newQuestion.text = questionData.question;
          newQuestion.answers = this.shuffle(answers);
          this.questions.push(newQuestion);
        });
      }
    },
    selectAnswer: function (index) {
      window.Vue.set(this.chosenAnswers, this.currentQuestionIndex, index);
    },
    prevQuestion: function () {
      if (this.questions.length > 0 && this.currentQuestionIndex > 0) {
        this.currentQuestionIndex--;
      }
    },
    nextQuestion: function () {
      if (this.currentQuestionIndex < this.questions.length) {
        this.currentQuestionIndex++;
      }
    },
    selectQuestion: function (index) {
      this.currentQuestionIndex = index;
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
    completionMessage: function () {
      let text = 'Better luck next time';

      if (this.calcScore() >= questions.length * 0.8) {
        text = 'Great work!';
      } else if (this.calcScore() >= questions.length / 2) {
        text = 'Good work!';
      }

      return text;
    },
    restartQuiz: function () {
      this.currentQuestionIndex = 0;
      this.chosenAnswers = [];
    },
    shuffle: function (arr) {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    },
  },
  filters: {
    decodeHtml(html) {
      const textArea = document.createElement('textarea');
      textArea.innerHTML = html;
      return textArea.value;
    },
  },
};
</script>

<style lang="scss" scoped>
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
.quiz-container {
  display: flex;
  position: relative;
  justify-content: center;
  max-width: 50rem;
  width: 100%;
  margin: 60px auto 0;
  padding: 4rem 1rem;
  text-align: center;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #555;
  background-color: #fff;
  border-radius: 15px;
}
.quiz {
  max-width: 40rem;
  width: 100%;
}
button,
.answer {
  &:hover {
    cursor: pointer;
  }
}
button {
  border: 0;
  border-radius: 0.25rem;
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
    opacity: 0.5;
    pointer-events: none;
  }
}
.answers-container {
  margin-top: 2.5rem;
}
.answer {
  max-width: 100%;
  padding: 1.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: #fff;
  background-color: #505b6c;
  border-radius: 0.75rem;
  transition: background-color 0.1s;
  & + * {
    margin-top: 0.5rem;
  }
  &:hover {
    background-color: #d04291;
  }
  &.is-selected {
    background-color: #dd1785;
  }
}
.nav-container {
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  margin-top: 2rem;
  .nav-steps {
    flex: 1 0 100%;
    .nav-step {
      margin: 10px;
    }
    button {
      padding: 0.5rem 1rem;
    }
    .is-active {
      background-color: #3b3e39;
    }
  }
}
</style>
