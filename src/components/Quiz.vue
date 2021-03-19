<template>
  <div>
    <div class="setup-container" v-if="!isStarted">
      <Loading v-if="categories.length == 0" text="Loading..." />
      <div v-else>
        <h1>Quizzem!</h1>
        <h2>Difficulty</h2>
        <div class="difficulties-container">
          <div
            class="setup-option"
            :class="{ 'is-selected': chosenDifficulty == difficulty.level }"
            v-for="(difficulty, index) in difficulties"
            :key="index"
            @click="setDifficulty(difficulty.level)"
          >{{ difficulty.name }}</div>
        </div>
        <h2>Category</h2>
        <div class="categories-container">
          <div
            class="setup-option"
            :class="{ 'is-selected': chosenCategory == null }"
            @click="setCategory(null)"
          >Any Category</div>
          <div
            class="setup-option"
            :class="{ 'is-selected': chosenCategory == category.id }"
            v-for="category in categories"
            :key="category.id"
            @click="setCategory(category.id)"
          >{{ category.name }}</div>
        </div>
        <button class="button button--start" type="button" @click="startQuiz()">Start</button>
      </div>
    </div>
    <div v-if="isStarted">
      <Loading v-if="questions.length == 0" text="Thinking of questions..." />
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
            :class="{ 'is-selected': chosenAnswers[currentQuestionIndex] == index }"
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
        <h2 class="completion-message">{{ completionMessage() }}</h2>
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

          // Remove extra categorisation from long category names
          this.categories.forEach((category) => {
            category.name = category.name.replace(/\w+: /gi, '');
          });
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
  text-align: center;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  @media screen and (min-width: 768px) {
    padding: 3rem 1rem;
  }
  @media screen and (min-width: 1200px) {
    max-width: 70rem;
  }
}
.setup-container {
  h1 {
    margin-top: 0;
  }
  h2 {
    font-size: 1.5rem;
    margin: 3rem auto 2rem;
    &::after {
      content: '';
      display: block;
      border-bottom: 5px solid #fff;
      width: 100px;
      margin: 1rem auto 0;
    }
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
  min-width: 100px;
  margin: 0.5rem;
  padding: 0.875rem;
  font-size: 1.125rem;
  color: #313030;
  background-color: $option-bg;
  border-radius: 1px;
  cursor: pointer;
  transition: all 0.1s;
  &:hover {
    color: #fff;
    background-color: $option-hover;
  }
  &.is-selected {
    background-color: $option-bg--active;
    color: #fff;
  }
}
.button--start {
  margin-top: 3rem;
  color: #fff;
  background-color: $btn-bg--active;
  &:hover {
    background-color: $btn-hover;
  }
}
.quiz {
  display: flex;
  flex-flow: row wrap;
  max-width: 40rem;
  width: 100%;
  & > * {
    flex: 1 1 100%;
  }
}
.answers-container {
  margin-top: 1rem;
  @media screen and (min-width: 768px) {
    margin-top: 3rem;
  }
}
.answer {
  margin-left: auto;
  margin-right: auto;
  font-size: 1.125rem;
  font-weight: 600;
  color: #313030;
  background-color: #fff;
  border-radius: 1px;
  &--option {
    max-width: 100%;
    padding: 1rem;
    cursor: pointer;
    transition: all 0.1s;
    &:hover {
      color: #fff;
      background-color: $option-hover;
    }
    &.is-selected {
      color: #fff;
      background-color: $option-bg--active;
    }
    & + * {
      margin-top: 0.75rem;
    }
  }
  &--correct,
  &--incorrect {
    margin-top: 0.75rem;
    margin-bottom: 0.25rem;
    padding: 1.25rem 1.5rem;
    color: #fff;
    @media screen and (min-width: 768px) {
      max-width: 50%;
    }
  }
  &--correct {
    background-color: #11b352;
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
.completion-message {
  font-size: 2.5rem;
}
.quiz-answers {
  margin-top: 3rem;
  border-top: 2px solid;
}
.quiz-answer {
  margin: 4rem 2rem 6rem;
  .question {
    margin-bottom: 2.5rem;
    font-size: 1.5rem;
    &::after {
      content: '';
      display: block;
      border-bottom: 5px solid #fff;
      width: 100px;
      margin: 2rem auto 0;
    }
  }
}
.restart-buttons {
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  align-items: center;
  margin-top: 2rem;

  .button {
    min-width: 290px;
    margin: 1rem 0.5rem 0;
  }
}
</style>
