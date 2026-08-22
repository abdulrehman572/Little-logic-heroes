import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Vibration,
  Platform,
  Modal,
  StatusBar,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import LottieView from 'lottie-react-native';

const { width, height } = Dimensions.get('window');

// ==================== CONSTANTS & CONFIG ====================
const COLORS = {
  primary: '#FF9A8B',
  secondary: '#99E2D0',
  accent: '#FFD966',
  purple: '#C5A3FF',
  pink: '#FFB3C6',
  teal: '#6DD3CE',
  background: '#FEF9E7',
  surface: '#FFFFFF',
  text: '#2D4059',
  textLight: '#5C6B7E',
  success: '#A3D9A5',
  error: '#F4A2A2',
  gold: '#F9D56E',
  shadow: '#000000',
};

// ==================== LEVELS & QUESTIONS (120) ====================
const LEVELS = [
  {
    name: "Level 1",
    questions: [
      { id: 1, text: "What letter does 'Apple' start with?", options: [{id:'A',label:'A'},{id:'B',label:'B'},{id:'C',label:'C'}], correct: 'A' },
      { id: 2, text: "Which word begins with 'B'?", options: [{id:'bat',label:'Bat'},{id:'cat',label:'Cat'},{id:'dog',label:'Dog'}], correct: 'bat' },
      { id: 3, text: "What is the first letter of 'Cat'?", options: [{id:'C',label:'C'},{id:'K',label:'K'},{id:'S',label:'S'}], correct: 'C' },
      { id: 4, text: "Which letter comes after A?", options: [{id:'A',label:'A'},{id:'B',label:'B'},{id:'C',label:'C'}], correct: 'B' },
      { id: 5, text: "What letter does 'Dog' end with?", options: [{id:'D',label:'D'},{id:'O',label:'O'},{id:'G',label:'G'}], correct: 'G' },
      { id: 6, text: "Which is a vowel?", options: [{id:'A',label:'A'},{id:'B',label:'B'},{id:'C',label:'C'}], correct: 'A' },
      { id: 7, text: "What is the last letter of 'Egg'?", options: [{id:'E',label:'E'},{id:'G',label:'G'},{id:'G2',label:'G'},{id:'G',label:'G'}], correct: 'G' }, // simplified
      { id: 8, text: "How many letters are in 'Hi'?", options: [{id:'1',label:'1'},{id:'2',label:'2'},{id:'3',label:'3'}], correct: '2' },
      { id: 9, text: "Which word starts with 'M'?", options: [{id:'moon',label:'Moon'},{id:'sun',label:'Sun'},{id:'star',label:'Star'}], correct: 'moon' },
      { id: 10, text: "What is the second letter of 'Red'?", options: [{id:'R',label:'R'},{id:'E',label:'E'},{id:'D',label:'D'}], correct: 'E' },
      { id: 11, text: "Which letter comes before C?", options: [{id:'A',label:'A'},{id:'B',label:'B'},{id:'C',label:'C'}], correct: 'B' },
      { id: 12, text: "Which word is spelled correctly?", options: [{id:'cat',label:'cat'},{id:'kat',label:'kat'},{id:'catt',label:'catt'}], correct: 'cat' },
      { id: 13, text: "What letter is missing? A, B, _, D", options: [{id:'C',label:'C'},{id:'E',label:'E'},{id:'F',label:'F'}], correct: 'C' },
      { id: 14, text: "Which word has 3 letters?", options: [{id:'dog',label:'dog'},{id:'fish',label:'fish'},{id:'bird',label:'bird'}], correct: 'dog' },
      { id: 15, text: "What is the first letter of 'Zebra'?", options: [{id:'Z',label:'Z'},{id:'X',label:'X'},{id:'Y',label:'Y'}], correct: 'Z' },
      { id: 16, text: "Which letter is a consonant?", options: [{id:'A',label:'A'},{id:'E',label:'E'},{id:'T',label:'T'}], correct: 'T' },
      { id: 17, text: "What is the last letter of 'Ball'?", options: [{id:'B',label:'B'},{id:'A',label:'A'},{id:'L',label:'L'}], correct: 'L' },
      { id: 18, text: "How many vowels are in 'cat'?", options: [{id:'1',label:'1'},{id:'2',label:'2'},{id:'3',label:'3'}], correct: '1' },
      { id: 19, text: "Which word starts with 'S'?", options: [{id:'sun',label:'sun'},{id:'run',label:'run'},{id:'fun',label:'fun'}], correct: 'sun' },
      { id: 20, text: "What is the middle letter of 'bat'?", options: [{id:'B',label:'B'},{id:'A',label:'A'},{id:'T',label:'T'}], correct: 'A' },
    ]
  },
  {
    name: "Level 2",
    questions: [
      { id: 21, text: "What letter comes after M?", options: [{id:'N',label:'N'},{id:'L',label:'L'},{id:'O',label:'O'}], correct: 'N' },
      { id: 22, text: "Which word is a color?", options: [{id:'red',label:'red'},{id:'run',label:'run'},{id:'rat',label:'rat'}], correct: 'red' },
      { id: 23, text: "Spell 'dog'", options: [{id:'dog',label:'d-o-g'},{id:'dgo',label:'d-g-o'},{id:'god',label:'g-o-d'}], correct: 'dog' },
      { id: 24, text: "What is the first letter of 'Frog'?", options: [{id:'F',label:'F'},{id:'G',label:'G'},{id:'R',label:'R'}], correct: 'F' },
      { id: 25, text: "Which word has the same beginning as 'tree'?", options: [{id:'train',label:'train'},{id:'bus',label:'bus'},{id:'car',label:'car'}], correct: 'train' },
      { id: 26, text: "How many letters in 'book'?", options: [{id:'3',label:'3'},{id:'4',label:'4'},{id:'5',label:'5'}], correct: '4' },
      { id: 27, text: "Which letter is missing? P, Q, R, _, T", options: [{id:'S',label:'S'},{id:'U',label:'U'},{id:'V',label:'V'}], correct: 'S' },
      { id: 28, text: "What is the last letter of 'mouse'?", options: [{id:'M',label:'M'},{id:'O',label:'O'},{id:'E',label:'E'}], correct: 'E' },
      { id: 29, text: "Which word rhymes with 'cat'?", options: [{id:'hat',label:'hat'},{id:'dog',label:'dog'},{id:'sun',label:'sun'}], correct: 'hat' },
      { id: 30, text: "What letter does 'ship' start with?", options: [{id:'S',label:'S'},{id:'H',label:'H'},{id:'P',label:'P'}], correct: 'S' },
      { id: 31, text: "Which word has 4 letters?", options: [{id:'book',label:'book'},{id:'pen',label:'pen'},{id:'cup',label:'cup'}], correct: 'book' },
      { id: 32, text: "What is the third letter of 'frog'?", options: [{id:'F',label:'F'},{id:'R',label:'R'},{id:'O',label:'O'}], correct: 'O' },
      { id: 33, text: "Which letter is a vowel?", options: [{id:'E',label:'E'},{id:'G',label:'G'},{id:'H',label:'H'}], correct: 'E' },
      { id: 34, text: "Spell 'fish'", options: [{id:'fish',label:'f-i-s-h'},{id:'fsh',label:'f-s-h'},{id:'fihs',label:'f-i-h-s'}], correct: 'fish' },
      { id: 35, text: "What comes after Z?", options: [{id:'A',label:'A'},{id:'Y',label:'Y'},{id:'none',label:'None'}], correct: 'none' },
      { id: 36, text: "Which word is a number?", options: [{id:'two',label:'two'},{id:'to',label:'to'},{id:'too',label:'too'}], correct: 'two' },
      { id: 37, text: "What is the first letter of 'queen'?", options: [{id:'Q',label:'Q'},{id:'U',label:'U'},{id:'E',label:'E'}], correct: 'Q' },
      { id: 38, text: "How many consonants in 'bat'?", options: [{id:'1',label:'1'},{id:'2',label:'2'},{id:'3',label:'3'}], correct: '2' },
      { id: 39, text: "Which word ends with 'g'?", options: [{id:'dog',label:'dog'},{id:'cat',label:'cat'},{id:'rat',label:'rat'}], correct: 'dog' },
      { id: 40, text: "What is the second letter of 'zoo'?", options: [{id:'Z',label:'Z'},{id:'O',label:'O'},{id:'O2',label:'O'}], correct: 'O' },
    ]
  },
  {
    name: "Level 3",
    questions: [
      { id: 41, text: "Which word comes first in the dictionary: 'apple' or 'banana'?", options: [{id:'apple',label:'apple'},{id:'banana',label:'banana'}], correct: 'apple' },
      { id: 42, text: "Spell 'house'", options: [{id:'house',label:'h-o-u-s-e'},{id:'hous',label:'h-o-u-s'},{id:'hoose',label:'h-o-o-s-e'}], correct: 'house' },
      { id: 43, text: "What is the missing letter? b _ g", options: [{id:'a',label:'a'},{id:'e',label:'e'},{id:'i',label:'i'}], correct: 'a' },
      { id: 44, text: "Which word has the same vowel sound as 'cake'?", options: [{id:'lake',label:'lake'},{id:'cat',label:'cat'},{id:'cow',label:'cow'}], correct: 'lake' },
      { id: 45, text: "How many letters in 'pencil'?", options: [{id:'5',label:'5'},{id:'6',label:'6'},{id:'7',label:'7'}], correct: '6' },
      { id: 46, text: "What is the first letter of 'knight' (silent letter)?", options: [{id:'K',label:'K'},{id:'N',label:'N'},{id:'I',label:'I'}], correct: 'K' },
      { id: 47, text: "Which word is a fruit?", options: [{id:'apple',label:'apple'},{id:'table',label:'table'},{id:'chair',label:'chair'}], correct: 'apple' },
      { id: 48, text: "Spell 'elephant'", options: [{id:'elephant',label:'e-l-e-p-h-a-n-t'},{id:'elefant',label:'e-l-e-f-a-n-t'},{id:'elephent',label:'e-l-e-p-h-e-n-t'}], correct: 'elephant' },
      { id: 49, text: "What letter is halfway through the alphabet?", options: [{id:'M',label:'M'},{id:'N',label:'N'},{id:'O',label:'O'}], correct: 'M' },
      { id: 50, text: "Which word has a silent 'e' at the end?", options: [{id:'name',label:'name'},{id:'man',label:'man'},{id:'men',label:'men'}], correct: 'name' },
      { id: 51, text: "How many vowels in 'school'?", options: [{id:'2',label:'2'},{id:'3',label:'3'},{id:'4',label:'4'}], correct: '2' },
      { id: 52, text: "Which word rhymes with 'light'?", options: [{id:'night',label:'night'},{id:'day',label:'day'},{id:'sun',label:'sun'}], correct: 'night' },
      { id: 53, text: "What is the last letter of 'world'?", options: [{id:'D',label:'D'},{id:'L',label:'L'},{id:'R',label:'R'}], correct: 'D' },
      { id: 54, text: "Spell 'giraffe'", options: [{id:'giraffe',label:'g-i-r-a-f-f-e'},{id:'girafe',label:'g-i-r-a-f-e'},{id:'jiraffe',label:'j-i-r-a-f-f-e'}], correct: 'giraffe' },
      { id: 55, text: "Which letter appears twice in 'banana'?", options: [{id:'A',label:'A'},{id:'B',label:'B'},{id:'N',label:'N'}], correct: 'A' },
      { id: 56, text: "What is the third letter of 'computer'?", options: [{id:'C',label:'C'},{id:'O',label:'O'},{id:'M',label:'M'}], correct: 'M' },
      { id: 57, text: "Which word has 5 letters?", options: [{id:'table',label:'table'},{id:'desk',label:'desk'},{id:'chair',label:'chair'}], correct: 'table' },
      { id: 58, text: "Spell 'butterfly'", options: [{id:'butterfly',label:'b-u-t-t-e-r-f-l-y'},{id:'buterfly',label:'b-u-t-e-r-f-l-y'},{id:'butterfli',label:'b-u-t-t-e-r-f-l-i'}], correct: 'butterfly' },
      { id: 59, text: "Which word is the odd one out? cat, dog, bird, car", options: [{id:'car',label:'car'},{id:'cat',label:'cat'},{id:'dog',label:'dog'}], correct: 'car' },
      { id: 60, text: "What letter is missing? A, C, E, G, _", options: [{id:'H',label:'H'},{id:'I',label:'I'},{id:'J',label:'J'}], correct: 'I' },
    ]
  },
  {
    name: "Level 4",
    questions: [
      { id: 61, text: "Which word comes last alphabetically? 'apple', 'banana', 'cherry'", options: [{id:'cherry',label:'cherry'},{id:'banana',label:'banana'},{id:'apple',label:'apple'}], correct: 'cherry' },
      { id: 62, text: "Spell 'mountain'", options: [{id:'mountain',label:'m-o-u-n-t-a-i-n'},{id:'mountin',label:'m-o-u-n-t-i-n'},{id:'moutain',label:'m-o-u-t-a-i-n'}], correct: 'mountain' },
      { id: 63, text: "What is the first vowel in 'rhythm'?", options: [{id:'y',label:'y'},{id:'h',label:'h'},{id:'none',label:'none'}], correct: 'none' },
      { id: 64, text: "How many syllables in 'elephant'?", options: [{id:'2',label:'2'},{id:'3',label:'3'},{id:'4',label:'4'}], correct: '3' },
      { id: 65, text: "Which word has a silent 'k'?", options: [{id:'knee',label:'knee'},{id:'kite',label:'kite'},{id:'kangaroo',label:'kangaroo'}], correct: 'knee' },
      { id: 66, text: "Spell 'dinosaur'", options: [{id:'dinosaur',label:'d-i-n-o-s-a-u-r'},{id:'dinasaur',label:'d-i-n-a-s-a-u-r'},{id:'dinosor',label:'d-i-n-o-s-o-r'}], correct: 'dinosaur' },
      { id: 67, text: "What is the last letter of the alphabet?", options: [{id:'Z',label:'Z'},{id:'Y',label:'Y'},{id:'A',label:'A'}], correct: 'Z' },
      { id: 68, text: "Which word is a verb?", options: [{id:'run',label:'run'},{id:'red',label:'red'},{id:'road',label:'road'}], correct: 'run' },
      { id: 69, text: "Spell 'library'", options: [{id:'library',label:'l-i-b-r-a-r-y'},{id:'libary',label:'l-i-b-a-r-y'},{id:'libray',label:'l-i-b-r-a-y'}], correct: 'library' },
      { id: 70, text: "How many letters in 'Wednesday'?", options: [{id:'9',label:'9'},{id:'8',label:'8'},{id:'10',label:'10'}], correct: '9' },
      { id: 71, text: "Which word has the same ending sound as 'laugh'?", options: [{id:'half',label:'half'},{id:'calf',label:'calf'},{id:'graph',label:'graph'}], correct: 'graph' },
      { id: 72, text: "What is the 10th letter of the alphabet?", options: [{id:'J',label:'J'},{id:'K',label:'K'},{id:'L',label:'L'}], correct: 'J' },
      { id: 73, text: "Spell 'chocolate'", options: [{id:'chocolate',label:'c-h-o-c-o-l-a-t-e'},{id:'choclate',label:'c-h-o-c-l-a-t-e'},{id:'chocolat',label:'c-h-o-c-o-l-a-t'}], correct: 'chocolate' },
      { id: 74, text: "Which word is a homophone for 'see'?", options: [{id:'sea',label:'sea'},{id:'saw',label:'saw'},{id:'say',label:'say'}], correct: 'sea' },
      { id: 75, text: "How many consonants in 'strengths'?", options: [{id:'6',label:'6'},{id:'7',label:'7'},{id:'8',label:'8'}], correct: '7' },
      { id: 76, text: "What is the first letter of 'psychology' (silent)?", options: [{id:'P',label:'P'},{id:'S',label:'S'},{id:'Y',label:'Y'}], correct: 'P' },
      { id: 77, text: "Spell 'strawberry'", options: [{id:'strawberry',label:'s-t-r-a-w-b-e-r-r-y'},{id:'strawbery',label:'s-t-r-a-w-b-e-r-y'},{id:'strawberri',label:'s-t-r-a-w-b-e-r-r-i'}], correct: 'strawberry' },
      { id: 78, text: "Which word is an antonym of 'hot'?", options: [{id:'cold',label:'cold'},{id:'cool',label:'cool'},{id:'warm',label:'warm'}], correct: 'cold' },
      { id: 79, text: "How many vowels in 'queue'?", options: [{id:'2',label:'2'},{id:'3',label:'3'},{id:'4',label:'4'}], correct: '3' },
      { id: 80, text: "What is the missing letter? S, M, T, W, T, F, _ (days of week)", options: [{id:'S',label:'S'},{id:'M',label:'M'},{id:'T',label:'T'}], correct: 'S' },
    ]
  },
  {
    name: "Level 5",
    questions: [
      { id: 81, text: "Which word is spelled correctly?", options: [{id:'accommodate',label:'accommodate'},{id:'accomodate',label:'accomodate'},{id:'acommodate',label:'acommodate'}], correct: 'accommodate' },
      { id: 82, text: "What is the longest word in English (commonly known)?", options: [{id:'pneumonoultramicroscopicsilicovolcanoconiosis',label:'pneumonoultramicroscopicsilicovolcanoconiosis'},{id:'antidisestablishment',label:'antidisestablishment'},{id:'floccinaucinihilipilification',label:'floccinaucinihilipilification'}], correct: 'pneumonoultramicroscopicsilicovolcanoconiosis' },
      { id: 83, text: "How many letters in 'antidisestablishment'?", options: [{id:'28',label:'28'},{id:'30',label:'30'},{id:'32',label:'32'}], correct: '28' },
      { id: 84, text: "Which word has a silent 'b'?", options: [{id:'doubt',label:'doubt'},{id:'baby',label:'baby'},{id:'bat',label:'bat'}], correct: 'doubt' },
      { id: 85, text: "Spell 'entrepreneur'", options: [{id:'entrepreneur',label:'e-n-t-r-e-p-r-e-n-e-u-r'},{id:'entrepeneur',label:'e-n-t-r-e-p-e-n-e-u-r'},{id:'entrepraneur',label:'e-n-t-r-e-p-r-a-n-e-u-r'}], correct: 'entrepreneur' },
      { id: 86, text: "What is the 15th letter of the alphabet?", options: [{id:'O',label:'O'},{id:'P',label:'P'},{id:'Q',label:'Q'}], correct: 'O' },
      { id: 87, text: "Which word is a palindrome?", options: [{id:'racecar',label:'racecar'},{id:'banana',label:'banana'},{id:'apple',label:'apple'}], correct: 'racecar' },
      { id: 88, text: "Spell 'pharaoh'", options: [{id:'pharaoh',label:'p-h-a-r-a-o-h'},{id:'pharoah',label:'p-h-a-r-o-a-h'},{id:'pharao',label:'p-h-a-r-a-o'}], correct: 'pharaoh' },
      { id: 89, text: "How many syllables in 'onomatopoeia'?", options: [{id:'5',label:'5'},{id:'6',label:'6'},{id:'7',label:'7'}], correct: '6' },
      { id: 90, text: "Which word is a synonym for 'quick'?", options: [{id:'fast',label:'fast'},{id:'slow',label:'slow'},{id:'large',label:'large'}], correct: 'fast' },
      { id: 91, text: "What is the first letter of 'xylophone'?", options: [{id:'X',label:'X'},{id:'Z',label:'Z'},{id:'Y',label:'Y'}], correct: 'X' },
      { id: 92, text: "Spell 'rhythm'", options: [{id:'rhythm',label:'r-h-y-t-h-m'},{id:'rythm',label:'r-y-t-h-m'},{id:'rhythem',label:'r-h-y-t-h-e-m'}], correct: 'rhythm' },
      { id: 93, text: "How many consonants in 'uncopyrightable'?", options: [{id:'7',label:'7'},{id:'8',label:'8'},{id:'9',label:'9'}], correct: '8' },
      { id: 94, text: "Which word has the most definitions in the dictionary?", options: [{id:'set',label:'set'},{id:'run',label:'run'},{id:'go',label:'go'}], correct: 'set' },
      { id: 95, text: "Spell 'conscientious'", options: [{id:'conscientious',label:'c-o-n-s-c-i-e-n-t-i-o-u-s'},{id:'consciencious',label:'c-o-n-s-c-i-e-n-c-i-o-u-s'},{id:'conscientous',label:'c-o-n-s-c-i-e-n-t-o-u-s'}], correct: 'conscientious' },
      { id: 96, text: "What is the 20th letter?", options: [{id:'T',label:'T'},{id:'U',label:'U'},{id:'V',label:'V'}], correct: 'T' },
      { id: 97, text: "Which word is an antonym of 'increase'?", options: [{id:'decrease',label:'decrease'},{id:'grow',label:'grow'},{id:'expand',label:'expand'}], correct: 'decrease' },
      { id: 98, text: "Spell 'mnemonic'", options: [{id:'mnemonic',label:'m-n-e-m-o-n-i-c'},{id:'nemonic',label:'n-e-m-o-n-i-c'},{id:'memonick',label:'m-e-m-o-n-i-c-k'}], correct: 'mnemonic' },
      { id: 99, text: "How many letters in 'floccinaucinihilipilification'?", options: [{id:'29',label:'29'},{id:'30',label:'30'},{id:'31',label:'31'}], correct: '29' },
      { id: 100, text: "What is the last letter of 'pneumonoultramicroscopicsilicovolcanoconiosis'?", options: [{id:'S',label:'S'},{id:'I',label:'I'},{id:'N',label:'N'}], correct: 'S' },
    ]
  },
  {
    name: "Level 6",
    questions: [
      { id: 101, text: "Which word is spelled correctly?", options: [{id:'unnecessary',label:'unnecessary'},{id:'unneccessary',label:'unneccessary'},{id:'unnecesary',label:'unnecesary'}], correct: 'unnecessary' },
      { id: 102, text: "What is the only word in English that ends with 'mt'?", options: [{id:'dreamt',label:'dreamt'},{id:'tempt',label:'tempt'},{id:'attempt',label:'attempt'}], correct: 'dreamt' },
      { id: 103, text: "How many vowels in 'strengths'?", options: [{id:'1',label:'1'},{id:'0',label:'0'},{id:'2',label:'2'}], correct: '1' },
      { id: 104, text: "Spell 'synecdoche'", options: [{id:'synecdoche',label:'s-y-n-e-c-d-o-c-h-e'},{id:'synechdoche',label:'s-y-n-e-c-h-d-o-c-h-e'},{id:'synedoche',label:'s-y-n-e-d-o-c-h-e'}], correct: 'synecdoche' },
      { id: 105, text: "Which word has all five vowels in order?", options: [{id:'abstemious',label:'abstemious'},{id:'facetious',label:'facetious'},{id:'sacrilegious',label:'sacrilegious'}], correct: 'facetious' },
      { id: 106, text: "What is the longest one-syllable word?", options: [{id:'screeched',label:'screeched'},{id:'strengths',label:'strengths'},{id:'through',label:'through'}], correct: 'screeched' },
      { id: 107, text: "Spell 'chiaroscurist'", options: [{id:'chiaroscurist',label:'c-h-i-a-r-o-s-c-u-r-i-s-t'},{id:'chiaroscourist',label:'c-h-i-a-r-o-s-c-o-u-r-i-s-t'},{id:'chiaroscrist',label:'c-h-i-a-r-o-s-c-r-i-s-t'}], correct: 'chiaroscurist' },
      { id: 108, text: "How many letters in 'hippopotomonstrosesquippedaliophobia'?", options: [{id:'36',label:'36'},{id:'37',label:'37'},{id:'38',label:'38'}], correct: '36' },
      { id: 109, text: "Which word is a heterogram (no letter repeated)?", options: [{id:'uncopyrightable',label:'uncopyrightable'},{id:'subdermatoglyphic',label:'subdermatoglyphic'},{id:'both',label:'both'}], correct: 'both' },
      { id: 110, text: "What is the only common word with three double letters in a row?", options: [{id:'bookkeeper',label:'bookkeeper'},{id:'committee',label:'committee'},{id:'success',label:'success'}], correct: 'bookkeeper' },
      { id: 111, text: "Spell 'otorhinolaryngologist'", options: [{id:'otorhinolaryngologist',label:'o-t-o-r-h-i-n-o-l-a-r-y-n-g-o-l-o-g-i-s-t'},{id:'otorinolaryngologist',label:'o-t-o-r-i-n-o-l-a-r-y-n-g-o-l-o-g-i-s-t'},{id:'otorhinolaryngoligist',label:'o-t-o-r-h-i-n-o-l-a-r-y-n-g-o-l-i-g-i-s-t'}], correct: 'otorhinolaryngologist' },
      { id: 112, text: "What is the 23rd letter?", options: [{id:'W',label:'W'},{id:'X',label:'X'},{id:'Y',label:'Y'}], correct: 'W' },
      { id: 113, text: "Which word is a palindrome?", options: [{id:'tattarrattat',label:'tattarrattat'},{id:'racecar',label:'racecar'},{id:'both',label:'both'}], correct: 'both' },
      { id: 114, text: "Spell 'philosophical'", options: [{id:'philosophical',label:'p-h-i-l-o-s-o-p-h-i-c-a-l'},{id:'philosophical',label:'p-h-i-l-o-s-o-p-h-i-c-a-l'},{id:'philosophical',label:'p-h-i-l-o-s-o-p-h-i-c-a-l'}], correct: 'philosophical' },
      { id: 115, text: "How many consonants in 'psychophysiology'?", options: [{id:'9',label:'9'},{id:'10',label:'10'},{id:'11',label:'11'}], correct: '10' },
      { id: 116, text: "Which word is a synonym for 'deceive'?", options: [{id:'bamboozle',label:'bamboozle'},{id:'clarify',label:'clarify'},{id:'explain',label:'explain'}], correct: 'bamboozle' },
      { id: 117, text: "What is the first letter of 'pseudopseudohypoparathyroidism'?", options: [{id:'P',label:'P'},{id:'S',label:'S'},{id:'H',label:'H'}], correct: 'P' },
      { id: 118, text: "Spell 'supercalifragilisticexpialidocious'", options: [{id:'supercalifragilisticexpialidocious',label:'s-u-p-e-r-c-a-l-i-f-r-a-g-i-l-i-s-t-i-c-e-x-p-i-a-l-i-d-o-c-i-o-u-s'},{id:'supercalifragilisticexpiallidocious',label:'s-u-p-e-r-c-a-l-i-f-r-a-g-i-l-i-s-t-i-c-e-x-p-i-a-l-l-i-d-o-c-i-o-u-s'},{id:'supercalifragilisticexpialidocius',label:'s-u-p-e-r-c-a-l-i-f-r-a-g-i-l-i-s-t-i-c-e-x-p-i-a-l-i-d-o-c-i-u-s'}], correct: 'supercalifragilisticexpialidocious' },
      { id: 119, text: "How many letters in the longest English word (technical)?", options: [{id:'189819',label:'189,819'},{id:'1899',label:'1,899'},{id:'18981',label:'18,981'}], correct: '189819' },
      { id: 120, text: "What is the last letter of the alphabet backwards?", options: [{id:'A',label:'A'},{id:'Z',label:'Z'},{id:'B',label:'B'}], correct: 'A' },
    ]
  }
];

// ==================== SOUND MANAGER ====================
class SoundManager {
  static sounds = {};
  static loaded = false;

  static async loadSounds() {
    const soundFiles = {
      success: require('../../assets/sounds/success.mp3'),
      error: require('../../assets/sounds/error.mp3'),
      click: require('../../assets/sounds/click.mp3'),
      levelUp: require('../../assets/sounds/levelup.mp3'),
      gameComplete: require('../../assets/sounds/complete.mp3'),
    };

    for (const [key, file] of Object.entries(soundFiles)) {
      try {
        const { sound } = await Audio.Sound.createAsync(file, { volume: 0.5 });
        this.sounds[key] = sound;
      } catch (e) {
        // Silently ignore missing sounds
      }
    }
    this.loaded = true;
  }

  static async play(key) {
    if (!this.loaded) return;
    const sound = this.sounds[key];
    if (!sound) return;
    try {
      await sound.replayAsync();
    } catch (e) {}
  }

  static async setVolume(volume) {
    for (const sound of Object.values(this.sounds)) {
      if (!sound) continue;
      try {
        await sound.setVolumeAsync(volume);
      } catch (e) {}
    }
  }
}

// ==================== HAPTIC MANAGER ====================
const HapticManager = {
  light: () => Platform.OS === 'ios' ? Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light) : Vibration.vibrate(10),
  medium: () => Platform.OS === 'ios' ? Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium) : Vibration.vibrate(20),
  success: () => Platform.OS === 'ios' ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success) : Vibration.vibrate([0, 50, 50, 50]),
  error: () => Platform.OS === 'ios' ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error) : Vibration.vibrate([0, 100, 50, 100]),
};

// ==================== MAIN GAME COMPONENT ====================
export default function ABCScreen() {
  const navigation = useNavigation();
  const { width, height } = useWindowDimensions();
  
  // Game State
  const [gameState, setGameState] = useState("loading");
  const [levelIndex, setLevelIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [score, setScore] = useState(0);               // marks for current level (2 per correct)
  const [totalScoreAccumulated, setTotalScoreAccumulated] = useState(0); // across all levels
  const [attempts, setAttempts] = useState(0);
  const [questionResolved, setQuestionResolved] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [levelUpMessage, setLevelUpMessage] = useState(null);
  const [soundsLoaded, setSoundsLoaded] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [currentOptions, setCurrentOptions] = useState([]); // dynamic options for current question

  // Animation Refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const confettiRef = useRef(null);
  
  // Timer Ref
  const timerRef = useRef(null);
  const advanceTimer = useRef(null);

  // Responsive sizes
  const shapeSize = Math.min(width * 0.18, height * 0.1);
  const fontSize = {
    small: width * 0.03,
    medium: width * 0.04,
    large: width * 0.05,
    xlarge: width * 0.07,
  };

  // ==================== MEMOIZED VALUES ====================
  const currentLevel = LEVELS[levelIndex];
  const currentQuestion = currentLevel?.questions[questionIndex];
  
  const totalLevels = LEVELS.length;
  const totalQuestionsInLevel = currentLevel?.questions.length || 0;
  const totalQuestionsAll = LEVELS.reduce((acc, level) => acc + level.questions.length, 0);
  const totalPossibleAll = totalQuestionsAll * 2;

  // Helper to shuffle array (Fisher‑Yates)
  const shuffleArray = (array) => {
    const a = [...array];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  // For text options, we only shuffle after a wrong attempt, no extra option added.
  const updateOptionsAfterWrong = () => {
    setCurrentOptions(shuffleArray(currentOptions));
  };

  // Reset options for new question
  useEffect(() => {
    if (currentQuestion) {
      setCurrentOptions(shuffleArray(currentQuestion.options));
    }
  }, [currentQuestion]);

  // ==================== LIFECYCLE ====================
  useEffect(() => {
    initializeGame();
    loadHighScore();
    loadSounds();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    };
  }, []);

  useEffect(() => {
    if (gameState === "playing") {
      startTimer();
      animateEntrance();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [questionIndex, levelIndex, gameState]);

  const initializeGame = async () => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    setGameState("levelSelect");
  };

  const loadSounds = async () => {
    await SoundManager.loadSounds();
    setSoundsLoaded(true);
  };

  const loadHighScore = async () => {
    try {
      const saved = await AsyncStorage.getItem('abc_highScore');
      if (saved) setHighScore(parseInt(saved));
    } catch (e) {}
  };

  const saveHighScore = async (newScore) => {
    if (newScore > highScore) {
      setHighScore(newScore);
      await AsyncStorage.setItem('abc_highScore', newScore.toString());
    }
  };

  const startTimer = () => {
    setTimeLeft(30);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleTimeOut = () => {
    if (questionResolved) return;
    if (timerRef.current) clearInterval(timerRef.current);
    
    showFeedback("error", "⏰ Time's up!");
    HapticManager.error();
    if (!isMuted && soundsLoaded) SoundManager.play('error');
    
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    
    if (newAttempts >= 3) {
      // Third wrong – question failed, move after delay
      setQuestionResolved(true);
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
      advanceTimer.current = setTimeout(() => advanceToNextQuestion(), 1000);
    } else {
      // Not yet 3 wrongs – shuffle options (no extra option for text)
      updateOptionsAfterWrong();
    }
  };

  const animateEntrance = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.1, duration: 200, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  };

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(1000),
      Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setFeedback(null));
  };

  const showLevelUpMessage = (message) => {
    setLevelUpMessage(message);
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(800),
      Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setLevelUpMessage(null));
  };

  const advanceToNextQuestion = () => {
    if (questionIndex + 1 < totalQuestionsInLevel) {
      setQuestionIndex(prev => prev + 1);
      setSelectedOptionId(null);
      setAttempts(0);
      setQuestionResolved(false);
      // options will reset via useEffect
    } else {
      // Level complete
      const newTotal = totalScoreAccumulated + score;
      setTotalScoreAccumulated(newTotal);
      saveHighScore(newTotal);
      
      if (levelIndex + 1 < totalLevels) {
        // More levels left
        setGameState("levelComplete");
        if (!isMuted && soundsLoaded) SoundManager.play('levelUp');
        if (confettiRef.current) confettiRef.current.play();
      } else {
        // All levels completed
        setGameState("gameComplete");
        if (!isMuted && soundsLoaded) SoundManager.play('gameComplete');
        if (confettiRef.current) confettiRef.current.play();
      }
    }
  };

  const handleOptionSelect = useCallback((optionId) => {
    if (gameState !== "playing" || questionResolved) return;
    setSelectedOptionId(optionId);
    HapticManager.light();
    if (!isMuted && soundsLoaded) SoundManager.play('click');
    
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.9, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  }, [gameState, questionResolved, isMuted, soundsLoaded]);

  const handleCheckAnswer = useCallback(() => {
    if (gameState !== "playing" || !selectedOptionId || questionResolved) {
      if (!selectedOptionId) {
        showFeedback("warning", "👆 Select an answer first!");
        HapticManager.error();
        if (!isMuted && soundsLoaded) SoundManager.play('error');
      }
      return;
    }

    const isCorrect = selectedOptionId === currentQuestion.correct;

    if (isCorrect) {
      // Correct answer: +2 marks, resolve, move after delay
      if (timerRef.current) clearInterval(timerRef.current);
      setScore(prev => prev + 2);
      showFeedback("success", "🎉 +2 marks!");
      HapticManager.success();
      if (!isMuted && soundsLoaded) SoundManager.play('success');
      if (confettiRef.current) confettiRef.current.play();
      setQuestionResolved(true);

      if (advanceTimer.current) clearTimeout(advanceTimer.current);
      advanceTimer.current = setTimeout(() => advanceToNextQuestion(), 1000);
    } else {
      // Wrong answer: increment attempts
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      showFeedback("error", "❌ Try again!");
      HapticManager.error();
      if (!isMuted && soundsLoaded) SoundManager.play('error');

      if (newAttempts >= 3) {
        // Third wrong – question failed, move after delay
        if (timerRef.current) clearInterval(timerRef.current);
        setQuestionResolved(true);
        if (advanceTimer.current) clearTimeout(advanceTimer.current);
        advanceTimer.current = setTimeout(() => advanceToNextQuestion(), 1000);
      } else {
        // Not yet 3 wrongs – shuffle options
        updateOptionsAfterWrong();
      }

      // Shake animation on error
      Animated.sequence([
        Animated.timing(rotateAnim, { toValue: 0.1, duration: 100, useNativeDriver: true }),
        Animated.timing(rotateAnim, { toValue: -0.1, duration: 100, useNativeDriver: true }),
        Animated.timing(rotateAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
      ]).start();
    }
  }, [gameState, selectedOptionId, questionResolved, currentQuestion, attempts, isMuted, soundsLoaded]);

  const handleLevelSelect = (index) => {
    setLevelIndex(index);
    setQuestionIndex(0);
    setScore(0);
    setAttempts(0);
    setQuestionResolved(false);
    setSelectedOptionId(null);
    setGameState("playing");
    HapticManager.success();
  };

  const handleRestartSameLevel = () => {
    setQuestionIndex(0);
    setScore(0);
    setAttempts(0);
    setQuestionResolved(false);
    setSelectedOptionId(null);
    setGameState("playing");
  };

  const handleNextLevel = () => {
    if (levelIndex + 1 < totalLevels) {
      setLevelIndex(prev => prev + 1);
      setQuestionIndex(0);
      setScore(0);
      setAttempts(0);
      setQuestionResolved(false);
      setSelectedOptionId(null);
      setGameState("playing");
    }
  };

  const handleChangeLevel = () => {
    setGameState("levelSelect");
    setLevelIndex(0);
  };

  const handlePlayAgain = () => {
    setLevelIndex(0);
    setQuestionIndex(0);
    setScore(0);
    setTotalScoreAccumulated(0);
    setAttempts(0);
    setQuestionResolved(false);
    setSelectedOptionId(null);
    setGameState("playing");
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    SoundManager.setVolume(isMuted ? 0.5 : 0);
  };

  // ==================== RENDER FUNCTIONS ====================
  if (gameState === "loading") {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <Text style={[styles.loadingEmoji, { fontSize: fontSize.xlarge * 2 }]}>🔤📚</Text>
        </Animated.View>
        <Text style={[styles.loadingText, { fontSize: fontSize.large }]}>Loading ABC Game...</Text>
        <View style={styles.progressBar}>
          <Animated.View style={[styles.progressFill, { width: "100%" }]} />
        </View>
      </SafeAreaView>
    );
  }

  if (gameState === "levelSelect") {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        <Text style={[styles.welcomeTitle, { fontSize: fontSize.xlarge }]}>🔤 ABC Game</Text>
        <Text style={[styles.welcomeSubtitle, { fontSize: fontSize.medium }]}>Choose a level!</Text>
        
        <ScrollView contentContainerStyle={styles.levelContainer} showsVerticalScrollIndicator={false}>
          {LEVELS.map((level, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.levelButton]}
              onPress={() => handleLevelSelect(idx)}
            >
              <Text style={[styles.levelButtonText, { fontSize: fontSize.large }]}>{level.name}</Text>
              <Text style={[styles.levelQuestions, { fontSize: fontSize.small }]}>{level.questions.length} questions</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity style={styles.settingsIcon} onPress={() => setSettingsVisible(true)}>
          <Text style={[styles.settingsText, { fontSize: fontSize.large }]}>⚙️</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (gameState === "levelComplete") {
    const isNewRecord = totalScoreAccumulated > highScore;

    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        <LottieView
          ref={confettiRef}
          source={require('../../assets/animations/confetti.json')}
          autoPlay
          loop={false}
          style={styles.confetti}
        />
        
        <Text style={[styles.completeTitle, { fontSize: fontSize.xlarge }]}>🎉 Level Complete! 🎉</Text>
        <Text style={[styles.completeSubtitle, { fontSize: fontSize.medium }]}>You finished this level</Text>
        
        <View style={[styles.resultCard, { padding: width * 0.05 }]}>
          <Text style={[styles.resultScore, { fontSize: fontSize.large }]}>Marks: {score} / {totalQuestionsInLevel * 2}</Text>
          {isNewRecord && <Text style={[styles.newRecord, { fontSize: fontSize.medium }]}>🏆 NEW RECORD! 🏆</Text>}
          <Text style={[styles.resultStat, { fontSize: fontSize.small }]}>Total Marks: {totalScoreAccumulated} / {totalPossibleAll}</Text>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.homeButton, { paddingHorizontal: width * 0.05, paddingVertical: height * 0.015 }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.actionButtonText, { fontSize: fontSize.medium }]}>Home</Text>
          </TouchableOpacity>
          
          {levelIndex + 1 < totalLevels && (
            <TouchableOpacity
              style={[styles.actionButton, styles.nextLevelButton, { paddingHorizontal: width * 0.05, paddingVertical: height * 0.015 }]}
              onPress={handleNextLevel}
            >
              <Text style={[styles.actionButtonText, { fontSize: fontSize.medium }]}>Next Level →</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    );
  }

  if (gameState === "gameComplete") {
    const isNewRecord = totalScoreAccumulated > highScore;

    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        <LottieView
          ref={confettiRef}
          source={require('../../assets/animations/confetti.json')}
          autoPlay
          loop={false}
          style={styles.confetti}
        />
        
        <Text style={[styles.completeTitle, { fontSize: fontSize.xlarge }]}>🏆 Game Complete! 🏆</Text>
        <Text style={[styles.completeSubtitle, { fontSize: fontSize.medium }]}>You finished all levels!</Text>
        
        <View style={[styles.resultCard, { padding: width * 0.05 }]}>
          <Text style={[styles.resultScore, { fontSize: fontSize.large }]}>Total Marks: {totalScoreAccumulated} / {totalPossibleAll}</Text>
          {isNewRecord && <Text style={[styles.newRecord, { fontSize: fontSize.medium }]}>🏆 NEW RECORD! 🏆</Text>}
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.playAgainButton, { paddingHorizontal: width * 0.05, paddingVertical: height * 0.015 }]}
            onPress={handlePlayAgain}
          >
            <Text style={[styles.actionButtonText, { fontSize: fontSize.medium }]}>Play Again</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.homeButton, { paddingHorizontal: width * 0.05, paddingVertical: height * 0.015 }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.actionButtonText, { fontSize: fontSize.medium }]}>Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentQuestion) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <Text>Loading question...</Text>
      </SafeAreaView>
    );
  }

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [-0.1, 0, 0.1],
    outputRange: ['-5deg', '0deg', '5deg'],
  });

  const renderOptions = () => {
    return currentOptions.map((opt, idx) => {
      const optionId = opt.id;
      const isSelected = selectedOptionId === optionId;

      return (
        <Animated.View
          key={idx}
          style={{
            transform: [
              { scale: isSelected ? scaleAnim : 1 },
              { rotate: rotateInterpolate }
            ]
          }}
        >
          <TouchableOpacity
            onPress={() => handleOptionSelect(optionId)}
            activeOpacity={0.7}
            disabled={questionResolved}
            style={[
              styles.optionTouch,
              { minWidth: width * 0.2, paddingHorizontal: 15, paddingVertical: 10 },
              isSelected && styles.optionSelected,
              questionResolved && styles.optionDisabled,
            ]}
          >
            <View style={[styles.textOption, { backgroundColor: COLORS.surface }]}>
              <Text style={[styles.optionText, { fontSize: fontSize.medium }]}>{opt.label}</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      );
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      <View style={[styles.header, { height: height * 0.08 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Text style={[styles.headerButtonText, { fontSize: fontSize.large }]}>←</Text>
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={[styles.levelText, { fontSize: fontSize.small }]}>L{levelIndex+1}/{totalLevels} Q{questionIndex+1}/{totalQuestionsInLevel}</Text>
          <Text style={[styles.levelName, { fontSize: fontSize.small }]}>{currentLevel.name}</Text>
        </View>
        
        <TouchableOpacity onPress={toggleMute} style={styles.headerButton}>
          <Text style={[styles.headerButtonText, { fontSize: fontSize.large }]}>{isMuted ? '🔇' : '🔊'}</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.statsBar, { height: height * 0.06 }]}>
        <View style={styles.statBadge}>
          <Text style={[styles.statBadgeIcon, { fontSize: fontSize.medium }]}>⭐</Text>
          <Text style={[styles.statBadgeText, { fontSize: fontSize.small }]}>{score}</Text>
        </View>
        
        <View style={[styles.statBadge, timeLeft < 10 && styles.statBadgeWarning]}>
          <Text style={[styles.statBadgeIcon, { fontSize: fontSize.medium }]}>⏰</Text>
          <Text style={[styles.statBadgeText, { fontSize: fontSize.small }]}>{timeLeft}s</Text>
        </View>
        
        <View style={styles.statBadge}>
          <Text style={[styles.statBadgeIcon, { fontSize: fontSize.medium }]}>❓</Text>
          <Text style={[styles.statBadgeText, { fontSize: fontSize.small }]}>{attempts}/3</Text>
        </View>
      </View>

      <View style={[styles.questionSection, { height: height * 0.15 }]}>
        <Text style={[styles.questionText, { fontSize: fontSize.small }]}>{currentQuestion.text}</Text>
      </View>

      {levelUpMessage && (
        <Animated.View style={[styles.levelUpOverlay, { opacity: fadeAnim }]}>
          <Text style={[styles.levelUpText, { fontSize: fontSize.large }]}>{levelUpMessage}</Text>
        </Animated.View>
      )}

      {feedback && (
        <Animated.View style={[styles.feedbackOverlay, { opacity: fadeAnim }]}>
          <Text style={[
            styles.feedbackText,
            { fontSize: fontSize.large },
            feedback.type === 'success' && styles.feedbackSuccess,
            feedback.type === 'error' && styles.feedbackError,
            feedback.type === 'warning' && styles.feedbackWarning,
          ]}>
            {feedback.message}
          </Text>
        </Animated.View>
      )}

      <ScrollView 
        contentContainerStyle={styles.optionsGridContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.optionsGrid}>
          {renderOptions()}
        </View>
      </ScrollView>

      <View style={[styles.controls, { height: height * 0.08 }]}>
        <TouchableOpacity
          style={[styles.controlButton, styles.checkButton, { paddingVertical: height * 0.015 }]}
          onPress={handleCheckAnswer}
          activeOpacity={0.8}
          disabled={questionResolved}
        >
          <Text style={[styles.controlButtonText, { fontSize: fontSize.medium }]}>✓ Check</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.progressContainer, { height: height * 0.03 }]}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${((questionIndex + 1) / totalQuestionsInLevel) * 100}%` }
            ]}
          />
        </View>
      </View>

      <Modal visible={settingsVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { width: width * 0.8, padding: width * 0.05 }]}>
            <Text style={[styles.modalTitle, { fontSize: fontSize.large }]}>Settings</Text>
            
            <TouchableOpacity style={styles.modalOption} onPress={toggleMute}>
              <Text style={[styles.modalOptionText, { fontSize: fontSize.medium }]}>
                Sound: {isMuted ? '🔇 Off' : '🔊 On'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalButton, styles.modalCloseButton, { paddingVertical: height * 0.015 }]}
              onPress={() => setSettingsVisible(false)}
            >
              <Text style={[styles.modalButtonText, { fontSize: fontSize.medium }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingEmoji: {
    marginBottom: 20,
  },
  loadingText: {
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 30,
  },
  levelContainer: {
    width: '90%',
    paddingVertical: 20,
    alignItems: 'center',
  },
  levelButton: {
    backgroundColor: COLORS.secondary,
    padding: 18,
    borderRadius: 40,
    marginVertical: 8,
    alignItems: 'center',
    elevation: 5,
    width: '100%',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  levelButtonText: {
    color: COLORS.text,
    fontWeight: '600',
  },
  levelQuestions: {
    color: COLORS.textLight,
    marginTop: 4,
  },
  welcomeTitle: {
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    color: COLORS.textLight,
    marginBottom: 30,
  },
  settingsIcon: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 10,
  },
  settingsText: {},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    elevation: 3,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerButtonText: {},
  headerCenter: {
    alignItems: 'center',
  },
  levelText: {
    color: COLORS.textLight,
  },
  levelName: {
    fontWeight: '600',
    color: COLORS.text,
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    marginVertical: 5,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statBadgeWarning: {
    backgroundColor: COLORS.error + '20',
  },
  statBadgeIcon: {
    marginRight: 4,
  },
  statBadgeText: {
    fontWeight: '600',
    color: COLORS.text,
  },
  questionSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
    marginVertical: 5,
  },
  questionText: {
    color: COLORS.text,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 22,
  },
  levelUpOverlay: {
    position: 'absolute',
    top: '25%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 20,
  },
  levelUpText: {
    backgroundColor: COLORS.secondary + 'CC',
    color: COLORS.text,
    fontWeight: 'bold',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 50,
    overflow: 'hidden',
  },
  optionsGridContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 10,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  optionTouch: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
  optionSelected: {
    transform: [{ scale: 1.1 }],
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
  },
  optionDisabled: {
    opacity: 0.5,
  },
  textOption: {
    borderRadius: 25,
    paddingHorizontal: 18,
    paddingVertical: 12,
    elevation: 3,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  optionText: {
    color: COLORS.text,
    fontWeight: '500',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginVertical: 10,
    gap: 10,
  },
  controlButton: {
    flex: 0.5,
    borderRadius: 30,
    alignItems: 'center',
    elevation: 3,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  checkButton: {
    backgroundColor: COLORS.success,
  },
  controlButtonText: {
    color: COLORS.text,
    fontWeight: 'bold',
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.secondary,
    borderRadius: 4,
  },
  feedbackOverlay: {
    position: 'absolute',
    top: '30%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 20,
  },
  feedbackText: {
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  feedbackSuccess: {
    color: COLORS.success,
  },
  feedbackError: {
    color: COLORS.error,
  },
  feedbackWarning: {
    color: COLORS.accent,
  },
  confetti: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  completeTitle: {
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  completeSubtitle: {
    color: COLORS.textLight,
    marginBottom: 30,
  },
  resultCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 30,
    elevation: 5,
    width: '80%',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  resultScore: {
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  newRecord: {
    color: COLORS.gold,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  resultStat: {
    color: COLORS.textLight,
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  actionButton: {
    borderRadius: 50,
    elevation: 3,
    minWidth: 120,
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  playAgainButton: {
    backgroundColor: COLORS.primary,
  },
  nextLevelButton: {
    backgroundColor: COLORS.accent,
  },
  homeButton: {
    backgroundColor: COLORS.secondary,
  },
  actionButtonText: {
    color: COLORS.text,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  modalTitle: {
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
    width: '100%',
    alignItems: 'center',
  },
  modalOptionText: {
    color: COLORS.text,
  },
  modalButton: {
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
  },
  modalCloseButton: {
    backgroundColor: COLORS.secondary,
  },
  modalButtonText: {
    color: COLORS.text,
    fontWeight: '600',
  },
});