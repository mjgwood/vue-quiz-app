<template>
  <div class="loading">
    <h1>Quizzem!</h1>
    <p>{{ text }}</p>
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
</template>

<script>
export default {
  name: 'Loading',
  props: {
    text: String,
  },
};
</script>

<style lang="scss" scoped>
.loading {
  p {
    font-size: 2rem;
  }
}
</style>