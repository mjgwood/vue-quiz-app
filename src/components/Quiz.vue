<template>
  <div>
    <div class="setup-container" v-if="!isStarted">
      <Loading v-if="categories.length == 0" text="Loading setup options..." />
      <div v-else>
        <h2>Choose your setup</h2>
        <h3>Category</h3>
        <div class="categories-container">
          <div
            class="setup-option"
            :class="{ 'is-selected': chosenCategory == null}"
            @click="setCategory(null)"
          >Any Category</div>
          <div
            class="setup-option"
            :class="{ 'is-selected': chosenCategory == category.id}"
            v-for="category in categories"
            :key="category.id"
            @click="setCategory(category.id)"
          >{{ category.name }}</div>
        </div>
        <h3>Difficulty</h3>
        <div class="difficulties-container">
          <div
            class="setup-option"
            :class="{ 'is-selected': chosenDifficulty == difficulty.level}"
            v-for="(difficulty, index) in difficulties"
            :key="index"
            @click="setDifficulty(difficulty.level)"
          >{{ difficulty.name }}</div>
        </div>
        <button class="button button--start" type="button" @click="startQuiz()">Start</button>
      </div>
    </div>
    <div v-if="isStarted">
      <Loading v-if="questions.length == 0" text="Loading your questions..." />
      <div
        class="quiz"
        v-else-if="currentQuestionIndex < questions.length"
        :key="currentQuestionIndex"
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
        <FooterNav
          :questions="questions"
          :chosenAnswers="chosenAnswers"
          :currentQuestionIndex="currentQuestionIndex"
          v-on:update-question-index="currentQuestionIndex = $event"
        />
      </div>
      <div
        v-else-if="currentQuestionIndex >= questions.length"
        :key="currentQuestionIndex"
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
          <button class="button" type="button" @click="reset()">Try again</button>
          <button class="button" type="button" @click="resetQuestions()">Restart with new questions</button>
          <button class="button" type="button" @click="resetAll()">New setup</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

import Loading from './Loading.vue';
import FooterNav from './FooterNav.vue';

const difficulties = [
  { level: null, name: 'Any Difficulty' },
  { level: 'easy', name: 'Easy' },
  { level: 'medium', name: 'Medium' },
  { level: 'hard', name: 'Hard' },
];

export default {
  name: 'Quiz',
  components: {
    Loading,
    FooterNav,
  },
  data() {
    return {
      isStarted: false,
      categories: [],
      difficulties: difficulties,
      chosenCategory: null,
      chosenDifficulty: null,
      questions: [],
      chosenAnswers: [],
      currentQuestionIndex: 0,
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    // Fetch the Open Trivia DB categories
    init() {
      const url = 'https://opentdb.com/api_category.php';

      axios
        .get(url)
        .then((response) => {
          // If results not returned successfully
          if (
            response.data.trivia_categories == null ||
            !response.data.trivia_categories.length
          ) {
            return Promise.reject(response);
          }

          this.categories = response.data.trivia_categories;
        })
        .catch((error) => {
          console.log(error);
          alert(
            'Sorry, something went wrong trying to load the categories. Please try again.'
          );
        });
    },
    // Update the chosen category
    setCategory(category) {
      this.chosenCategory = category;
    },
    // Update the chosen difficulty level
    setDifficulty(level) {
      this.chosenDifficulty = level;
    },
    // Fetch question data from Open Trivia DB and call populateQuestions()
    startQuiz() {
      const url = this.generateUrl();

      this.isStarted = true;

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
    // Create the Open Trivia DB URL with the chosen parameters
    generateUrl() {
      let difficultyParam =
        this.chosenDifficulty == null
          ? ''
          : `&difficulty=${this.chosenDifficulty}`;
      let categoryParam =
        this.chosenCategory == null ? '' : `&category=${this.chosenCategory}`;

      return `https://opentdb.com/api.php?amount=5${categoryParam}${difficultyParam}`;
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

      if (this.calcScore() >= this.questions.length * 0.8) {
        text = 'Great work!';
      } else if (this.calcScore() >= this.questions.length / 2) {
        text = 'Good work!';
      }

      return text;
    },
    // Check if a given index is the correct answer for a given question
    answerCorrect(question, answerIndex) {
      return question.answers[answerIndex].correct;
      // question.answers.find(a => a.correct == true);
    },
    // Reset quiz with the same questions
    reset() {
      this.currentQuestionIndex = 0;
      this.chosenAnswers = [];
    },
    // Reset quiz with the new questions
    resetQuestions() {
      this.questions = [];
      this.startQuiz();
      this.reset();
    },
    // Reset everything for new setup
    resetAll() {
      this.chosenCategory = null;
      this.chosenDifficulty = null;
      this.questions = [];
      this.reset();
      this.isStarted = false;
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
  border-radius: 10px;
  box-shadow: 0 10px 20px rgba(45, 45, 45, 0.19),
    0 6px 6px rgba(74, 74, 74, 0.23);
}
.setup-container {
  h2 {
    padding-bottom: 3rem;
    border-bottom: 1px solid;
  }
  h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }
}
.categories-container,
.difficulties-container {
  display: flex;
  justify-content: space-evenly;
  flex-flow: row wrap;
}
.setup-option {
  flex: 1 1 auto;
  margin: 0.5rem;
  padding: 1rem;
  font-size: 1.125rem;
  border: 1px solid #6f7379;
  border-radius: 50px;
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
}
.button--start {
  margin-top: 2rem;
  background-color: #dd1785;
  &:hover {
    background-color: #c8438d;
  }
}
.quiz {
  max-width: 40rem;
  width: 100%;
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
    border: 1px solid #6f7379;
    border-radius: 50px;
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
.restart-buttons {
  display: flex;
  flex-flow: row wrap;
  justify-content: space-evenly;
  align-items: center;
  margin-top: 2rem;

  .button {
    min-width: 290px;
    margin-top: 1rem;
  }
}
</style>
