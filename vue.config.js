module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? '/vue-quiz-app/' : '/',
  css: {
    loaderOptions: {
      sass: {
        additionalData: `@import "@/styles/_variables.scss";`
      }
    }
  }
};
