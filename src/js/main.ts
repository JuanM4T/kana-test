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
} from "./kana";

// Constants
const STANDARD = 1;
const DAKUON = 2;
const COMBO = 4;

// Variables
let sessionCounter = 0;
let totalCounter = parseInt(localStorage.getItem("totalCounter") || "0");
let previousIndex = -1;
let enabledOptions = STANDARD;

// Syllabary
const syllabaryEl = document.querySelector("[data-syllabary]");
const syllabary = syllabaryEl?.getAttribute("data-syllabary");

// DOM Elements
const sessionCounterElement = document.getElementById("session-counter");
const totalCounterElement = document.getElementById("total-counter");
const kanaCharacterElement = document.getElementById("kana-character");
const optionsElement = document.getElementById("options");

// Checkboxes
const standardCheckbox = document.getElementById("standard-checkbox");
const dakuonCheckbox = document.getElementById("dakuon-checkbox");
const comboCheckbox = document.getElementById("combo-checkbox");

// Event listeners
standardCheckbox?.addEventListener("change", () => toggleOption(STANDARD));
dakuonCheckbox?.addEventListener("change", () => toggleOption(DAKUON));
comboCheckbox?.addEventListener("change", () => toggleOption(COMBO));

function toggleOption(option: number) {
  // Toggle the option
  enabledOptions ^= option;
  nextCharacter();
}

function getKanaArray() {
  const selectedKana: string[] = [];
  switch (syllabary) {
    case "hiragana":
      if (enabledOptions & COMBO) selectedKana.push(...comboHiragana);
      if (enabledOptions & DAKUON) selectedKana.push(...dakuonHiragana);
      if (enabledOptions & STANDARD) selectedKana.push(...standardHiragana);
      if (selectedKana.length === 0) selectedKana.push(...standardHiragana);
      break;
    case "katakana":
      if (enabledOptions & COMBO) selectedKana.push(...comboKatakana);
      if (enabledOptions & DAKUON) selectedKana.push(...dakuonKatakana);
      if (enabledOptions & STANDARD) selectedKana.push(...standardKatakana);
      if (selectedKana.length === 0) selectedKana.push(...standardKatakana);
      break;
  }
  return selectedKana;
}

function updateCounters() {
  sessionCounterElement!.textContent = sessionCounter.toString();
  totalCounterElement!.textContent = totalCounter.toString();
}

function handleAnswer(
  selectedOption: string,
  optionElement: HTMLDivElement,
  correctRomaji: string
) {
  if (!optionElement.classList.contains("incorrect")) {
    if (selectedOption === correctRomaji) {
      sessionCounter++;
      totalCounter++;

      localStorage.setItem("totalCounter", totalCounter.toString());
      updateCounters();

      // Maybe add a transition?
      setTimeout(nextCharacter, 0);
    } else {
      optionElement.classList.add("incorrect");
    }
  }
}

function createOptionElement(option: string, correctRomaji: string) {
  const optionElement = document.createElement("div");
  optionElement.classList.add("option");
  optionElement.textContent = option;
  optionElement.onclick = () => {
    handleAnswer(option, optionElement, correctRomaji);
  };
  return optionElement;
}

function getRandomCharIndex(maxLength: number) {
  let charIndex = Math.floor(Math.random() * maxLength);
  while (charIndex === previousIndex) {
    charIndex = Math.floor(Math.random() * maxLength);
  }
  previousIndex = charIndex;
  return charIndex;
}

function getAnswerCategory(
  optionType: number,
  romajiArray: string[],
  charIndex: number
) {
  let correctAnswerCategory = 0;

  if (charIndex < romajiArray.length) {
    correctAnswerCategory = optionType;
  }
  return correctAnswerCategory;
}

function generateIncorrectAnswers(
  correctRomaji: string,
  correctAnswerCategory: number
) {
  const categoryRomaji = getCategoryRomaji(correctAnswerCategory);
  const incorrectAnswers: string[] = [];

  while (incorrectAnswers.length < 9) {
    const randomIncorrectIndex = Math.floor(
      Math.random() * categoryRomaji.length
    );
    const randomIncorrectRomaji = categoryRomaji[randomIncorrectIndex];

    if (
      randomIncorrectRomaji !== correctRomaji &&
      !incorrectAnswers.includes(randomIncorrectRomaji)
    ) {
      incorrectAnswers.push(randomIncorrectRomaji);
    }
  }

  return incorrectAnswers;
}

function getCategoryRomaji(correctAnswerCategory: number) {
  switch (correctAnswerCategory) {
    case STANDARD:
      return standardRomaji;
    case DAKUON:
      return dakuonRomaji;
    case COMBO:
      return comboRomaji;
    default:
      return standardRomaji;
  }
}

function nextCharacter() {
  const kanaArray = getKanaArray();
  const charIndex = getRandomCharIndex(kanaArray.length);
  let answerCategory = 0;

  const romajiArray: string[] = [];

  if (enabledOptions & COMBO) {
    romajiArray.push(...comboRomaji);
    answerCategory = getAnswerCategory(COMBO, romajiArray, charIndex);
  }

  if (enabledOptions & DAKUON && answerCategory === 0) {
    romajiArray.push(...dakuonRomaji);
    answerCategory = getAnswerCategory(DAKUON, romajiArray, charIndex);
  }

  if (
    (enabledOptions & STANDARD || romajiArray.length === 0) &&
    answerCategory === 0
  ) {
    romajiArray.push(...standardRomaji);
    answerCategory = getAnswerCategory(STANDARD, romajiArray, charIndex);
  }

  const randomCharacter = kanaArray[charIndex];
  const correctRomaji = romajiArray[charIndex];

  optionsElement!.innerHTML = "";

  const incorrectAnswers = generateIncorrectAnswers(
    correctRomaji,
    answerCategory
  );

  const romajiOptions = [correctRomaji, ...incorrectAnswers];
  romajiOptions.sort(() => Math.random() - 0.5);

  kanaCharacterElement!.textContent = randomCharacter;

  romajiOptions.forEach((option) => {
    const optionElement = createOptionElement(option, correctRomaji);
    optionsElement?.appendChild(optionElement);
  });
}

updateCounters();
nextCharacter();
