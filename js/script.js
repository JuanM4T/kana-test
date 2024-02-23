import {
  standardHiragana,
  standardKatakana,
  standardRomaji,
  dakuonHiragana,
  dakuonKatakana,
  dakuonRomaji,
  comboHiragana,
  comboKatakana,
  comboRomaji,
} from "./kana.js";

let sessionCounter = 0;
let totalCounter = localStorage.getItem("totalCounter") || 0;
let previousIndex = -1;

const sessionCounterElement = document.getElementById("session-counter");
const totalCounterElement = document.getElementById("total-counter");
const kanaCharacterElement = document.getElementById("kana-character");
const optionsElement = document.getElementById("options");

const syllabary = document
  .querySelector("[data-syllabary]")
  .getAttribute("data-syllabary");

const standardCheckbox = document.getElementById("standard-checkbox");
const dakuonCheckbox = document.getElementById("dakuon-checkbox");
const comboCheckbox = document.getElementById("combo-checkbox");

let enabledOptions = 1; // 1 (binary 001) means only standard is enabled

const OPTION_STANDARD = 1; // binary 001
const OPTION_DAKUON = 2; // binary 010
const OPTION_COMBO = 4; // binary 100

standardCheckbox.addEventListener("change", () => toggleOption(OPTION_STANDARD));
dakuonCheckbox.addEventListener("change", () => toggleOption(OPTION_DAKUON));
comboCheckbox.addEventListener("change", () => toggleOption(OPTION_COMBO));

function toggleOption(option) {
  if (enabledOptions & option) {
    // if option is enabled, disable it
    enabledOptions &= ~option;
  } else {
    // if option is disabled, enable it
    enabledOptions |= option;
  }
  nextCharacter();
}

function getKanaArray() {
  let selectedKana = [];
  if (syllabary === "hiragana") {
    if (enabledOptions & OPTION_COMBO) selectedKana = selectedKana.concat(comboHiragana);
    if (enabledOptions & OPTION_DAKUON) selectedKana = selectedKana.concat(dakuonHiragana);
    if ((enabledOptions & OPTION_STANDARD) || selectedKana.length === 0) {
      selectedKana = selectedKana.concat(standardHiragana);
    }
  } else if (syllabary === "katakana") {
    if (enabledOptions & OPTION_COMBO) selectedKana = selectedKana.concat(comboKatakana);
    if (enabledOptions & OPTION_DAKUON) selectedKana = selectedKana.concat(dakuonKatakana);
    if ((enabledOptions & OPTION_STANDARD) || selectedKana.length === 0) {
      selectedKana = selectedKana.concat(standardKatakana);
    }
  }
  return selectedKana;
}

function updateCounters() {
  sessionCounterElement.textContent = sessionCounter;
  totalCounterElement.textContent = totalCounter;
}

function handleAnswer(selectedOption, optionElement, correctRomaji) {
  if (!optionElement.classList.contains("incorrect")) {
    if (selectedOption === correctRomaji) {
      sessionCounter++;
      totalCounter++;

      localStorage.setItem("totalCounter", totalCounter);
      updateCounters();

      // Maybe add a transition?
      setTimeout(nextCharacter, 0);
    } else {
      optionElement.classList.add("incorrect");
    }
  }
}

function createOptionElement(option, correctRomaji) {
  const optionElement = document.createElement("div");
  optionElement.classList.add("option");
  optionElement.textContent = option;
  optionElement.onclick = () => {
    handleAnswer(option, optionElement, correctRomaji);
  };
  return optionElement;
}

function nextCharacter() {
  let romajiArray = [];
  if (enabledOptions & OPTION_COMBO) romajiArray = romajiArray.concat(comboRomaji);
  if (enabledOptions & OPTION_DAKUON) romajiArray = romajiArray.concat(dakuonRomaji);
  if ((enabledOptions & OPTION_STANDARD) || romajiArray.length === 0) {
    romajiArray = romajiArray.concat(standardRomaji);
  }

  const kanaArray = getKanaArray();
  let charIndex = Math.floor(Math.random() * kanaArray.length);
  while (charIndex === previousIndex) {
    charIndex = Math.floor(Math.random() * kanaArray.length);
  }
  previousIndex = charIndex;
  const randomCharacter = kanaArray[charIndex];
  const correctRomaji = romajiArray[charIndex];

  optionsElement.innerHTML = "";

  const incorrectAnswers = [];
  while (incorrectAnswers.length < 9) {
    const randomIncorrectIndex = Math.floor(
      Math.random() * standardRomaji.length,
    );
    const randomIncorrectRomaji = standardRomaji[randomIncorrectIndex];

    if (
      randomIncorrectRomaji !== correctRomaji &&
      !incorrectAnswers.includes(randomIncorrectRomaji)
    ) {
      incorrectAnswers.push(randomIncorrectRomaji);
    }
  }

  const romajiOptions = [correctRomaji, ...incorrectAnswers];
  romajiOptions.sort(() => Math.random() - 0.5);

  kanaCharacterElement.textContent = randomCharacter;

  romajiOptions.forEach((option) => {
    const optionElement = createOptionElement(option, correctRomaji);
    optionsElement.appendChild(optionElement);
  });
}

updateCounters();
nextCharacter();
