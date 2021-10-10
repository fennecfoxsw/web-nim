/* global AOS */

AOS.init({
  duration: 500,
  once: true,
  offset: -9999,
});

const userLanguage = navigator.language;
const koreanButton = document.getElementById('ko-button');
const englishButton = document.getElementById('en-button');

if (userLanguage === 'ko-KR') {
  englishButton.classList.add('btn-secondary');
  koreanButton.classList.add('btn-primary');
} else {
  koreanButton.classList.add('btn-secondary');
  englishButton.classList.add('btn-primary');
}
