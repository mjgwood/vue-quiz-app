<template>
  <div>
    <div class="loading" v-if="questions.length == 0">
      <p>Loading your questions...</p>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        style="margin: auto; display: block;"
        width="200px"
        height="200px"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid"
      >
        <rect x="17.5" y="30" width="15" height="40" fill="#dd1785">
          <animate
            attributeName="y"
            repeatCount="indefinite"
            dur="1s"
            calcMode="spline"
            keyTimes="0;0.5;1"
            values="18;30;30"
            keySplines="0 0.5 0.5 1;0 0.5 0.5 1"
            begin="-0.2s"
          />
          <animate
            attributeName="height"
            repeatCount="indefinite"
            dur="1s"
            calcMode="spline"
            keyTimes="0;0.5;1"
            values="64;40;40"
            keySplines="0 0.5 0.5 1;0 0.5 0.5 1"
            begin="-0.2s"
          />
        </rect>
        <rect x="42.5" y="30" width="15" height="40" fill="#ce2683">
          <animate
            attributeName="y"
            repeatCount="indefinite"
            dur="1s"
            calcMode="spline"
            keyTimes="0;0.5;1"
            values="20.999999999999996;30;30"
            keySplines="0 0.5 0.5 1;0 0.5 0.5 1"
            begin="-0.1s"
          />
          <animate
            attributeName="height"
            repeatCount="indefinite"
            dur="1s"
            calcMode="spline"
            keyTimes="0;0.5;1"
            values="58.00000000000001;40;40"
            keySplines="0 0.5 0.5 1;0 0.5 0.5 1"
            begin="-0.1s"
          />
        </rect>
        <rect x="67.5" y="30" width="15" height="40" fill="#b21c77">
          <animate
            attributeName="y"
            repeatCount="indefinite"
            dur="1s"
            calcMode="spline"
            keyTimes="0;0.5;1"
            values="20.999999999999996;30;30"
            keySplines="0 0.5 0.5 1;0 0.5 0.5 1"
          />
          <animate
            attributeName="height"
            repeatCount="indefinite"
            dur="1s"
            calcMode="spline"
            keyTimes="0;0.5;1"
            values="58.00000000000001;40;40"
            keySplines="0 0.5 0.5 1;0 0.5 0.5 1"
          />
        </rect>
      </svg>
    </div>
    <div
      class="quiz"
      v-else-if="currentQuestionIndex < questions.length"
      v-bind:key="currentQuestionIndex"
    >
      <h2>{{ questions[currentQuestionIndex].text | decodeHtml }}</h2>
      <div class="answers-container">
        <div
          class="answer answer--option"
          v-for="(answer, index) in questions[currentQuestionIndex].answers"
          @click="selectAnswer(index)"
          :class="{ 'is-selected': chosenAnswers[currentQuestionIndex] == index}"
          :key="index"
        >{{ answer.text | decodeHtml }}</div>
      </div>
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
    </div>
    <div
      v-else-if="currentQuestionIndex >= questions.length"
      v-bind:key="currentQuestionIndex"
      class="quiz-completed"
    >
      <p class="score">{{ calcScore() }} / {{ questions.length }}</p>
      <h2>{{ completionMessage() }}</h2>
      <div class="quiz-answers">
        <div
          class="quiz-answer"
          v-for="(question, index) in questions"
          :class="{ 'is-selected': chosenAnswers[currentQuestionIndex] == index}"
          :key="index"
        >
          <h3 class="question">{{ question.text | decodeHtml }}</h3>
          <p
            class="answer answer--correct"
          >Correct answer: {{ question.answers.find(a => a.correct == true).text | decodeHtml }}</p>
          <p
            v-if="!answerCorrect(question, chosenAnswers[index])"
            class="answer answer--incorrect"
          >Your answer: {{ question.answers[chosenAnswers[index]].text | decodeHtml }}</p>
        </div>
      </div>
      <div class="restart-buttons">
        <button class="button" type="button" @click="restartQuiz()">Try again</button>
        <button class="button" type="button" @click="restartQuiz(true)">Restart with new questions</button>
      </div>
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
    this.init();
  },
  methods: {
    // Fetch question data from Open Trivia DB and call populateQuestions()
    init() {
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
    // Populate questions array
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
    // Set user's chosen answer
    selectAnswer(index) {
      window.Vue.set(this.chosenAnswers, this.currentQuestionIndex, index);
    },
    // Decrement currentQuestionIndex
    prevQuestion() {
      if (this.questions.length > 0 && this.currentQuestionIndex > 0) {
        this.currentQuestionIndex--;
      }
    },
    // Increment currentQuestionIndex
    nextQuestion() {
      if (this.currentQuestionIndex < this.questions.length) {
        this.currentQuestionIndex++;
      }
    },
    // Update currentQuestionIndex to given index
    selectQuestion(index) {
      this.currentQuestionIndex = index;
    },
    // Calculate user's total score
    calcScore() {
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
    // Generate completionMessage based on score %
    completionMessage() {
      let text = 'Better luck next time';

      if (this.calcScore() >= questions.length * 0.8) {
        text = 'Great work!';
      } else if (this.calcScore() >= questions.length / 2) {
        text = 'Good work!';
      }

      return text;
    },
    // Check if a given index is the correct answer for a given question
    answerCorrect(question, answerIndex) {
      return question.answers[answerIndex].correct;
      // question.answers.find(a => a.correct == true);
    },
    // Restart quiz, and optionally fetch new questions
    restartQuiz(newQuestions = false) {
      if (newQuestions) {
        this.questions = [];
        this.init();
      }

      this.currentQuestionIndex = 0;
      this.chosenAnswers = [];
    },
    // Utility Durstenfeld array shuffle
    shuffle(arr) {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    },
  },
  filters: {
    // Convert strings of HTML entities to characters
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
  margin: 0 auto;
  padding: 3rem 1rem;
  text-align: center;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #555;
  background-color: #fff;
  border-radius: 15px;
  box-shadow: 0 10px 20px rgba(45, 45, 45, 0.19),
    0 6px 6px rgba(74, 74, 74, 0.23);
}
.quiz {
  max-width: 40rem;
  width: 100%;
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
  &--next {
    background-color: #dd1785;
    &:hover {
      background-color: #c8438d;
    }
  }
  &[disabled] {
    background-color: #a9aaac;
    pointer-events: none;
  }
}
.loading {
  p {
    font-size: 2rem;
  }
}
.answers-container {
  margin-top: 2.5rem;
}
.answer {
  margin-left: auto;
  margin-right: auto;
  font-size: 1.125rem;
  font-weight: 600;
  &--option {
    max-width: 100%;
    padding: 1rem;
    border: 2px solid #6f7379;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.1s;
    &:hover {
      color: #c8438d;
      border-color: #c8438d;
    }
    &.is-selected {
      color: #dd1785;
      border-color: #dd1785;
    }
    & + * {
      margin-top: 0.5rem;
    }
  }
  &--correct,
  &--incorrect {
    max-width: 80%;
    margin-top: 0.5rem;
    margin-bottom: 0.25rem;
    padding: 0.75rem 1.5rem;
    color: #fff;
    border-radius: 50px;
  }
  &--correct {
    background-color: #16a850;
  }
  &--incorrect {
    background-color: #d41f22;
  }
}
.score {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 10rem;
  height: 10rem;
  margin: 0 auto;
  font-size: 3rem;
  font-weight: 600;
  border: 0.375rem solid;
  border-radius: 50%;
}
.quiz-answers {
  margin-top: 2rem;
  border-top: 1px solid;
}
.quiz-answer {
  .question {
    margin-bottom: 1rem;
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
    .button {
      width: 3rem;
      height: 3rem;
      padding: 0.5rem 1rem;
    }
    .is-active {
      background-color: #3b3e39;
    }
  }
}
.restart-buttons {
  display: flex;
  flex-flow: column;
  align-items: center;
  margin-top: 2rem;

  .button {
    min-width: 290px;
    & + * {
      margin-top: 0.5rem;
    }
  }
}
</style>
