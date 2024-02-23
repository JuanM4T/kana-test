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

let enableStandard = true;
let enableDakuon = false;
let enableCombo = false;

standardCheckbox.addEventListener("change", toggleStandard);
dakuonCheckbox.addEventListener("change", toggleDakuon);
comboCheckbox.addEventListener("change", toggleCombo);

function toggleStandard() {
  enableStandard = standardCheckbox.checked;
  nextCharacter();
}

function toggleDakuon() {
  enableDakuon = dakuonCheckbox.checked;
  nextCharacter();
}

function toggleCombo() {
  enableCombo = comboCheckbox.checked;
  nextCharacter();
}

function getKanaArray() {
  let selectedKana = [];
  if (syllabary === "hiragana") {
    if (enableCombo) selectedKana = selectedKana.concat(comboHiragana);
    if (enableDakuon) selectedKana = selectedKana.concat(dakuonHiragana);
    if (enableStandard || selectedKana.length === 0) {
      selectedKana = selectedKana.concat(standardHiragana);
    }
  } else if (syllabary === "katakana") {
    if (enableCombo) selectedKana = selectedKana.concat(comboKatakana);
    if (enableDakuon) selectedKana = selectedKana.concat(dakuonKatakana);
    if (enableStandard || selectedKana.length === 0) {
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
  if (enableCombo) romajiArray = romajiArray.concat(comboRomaji);
  if (enableDakuon) romajiArray = romajiArray.concat(dakuonRomaji);
  if (enableStandard || romajiArray.length === 0) {
    romajiArray = romajiArray.concat(standardRomaji);
  }

  const kanaArray = getKanaArray();
  while (charIndex === previousIndex) {
    const charIndex = Math.floor(Math.random() * kanaArray.length);
  }
  previousIndex = charIndex;
  const randomCharacter = kanaArray[charIndex];
  const correctRomaji = romajiArray[charIndex];

  optionsElement.innerHTML = "";

  const incorrectAnswers = [];
  while (incorrectAnswers.length < 9) {
    const randomIncorrectIndex = Math.floor(Math.random() * romajiArray.length);
    const randomIncorrectRomaji = romajiArray[randomIncorrectIndex];

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
