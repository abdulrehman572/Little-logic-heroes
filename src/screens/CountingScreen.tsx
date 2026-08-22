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
      { id: 1, text: "How many apples? 🍎", options: [{id:'1',label:'1'},{id:'2',label:'2'},{id:'3',label:'3'}], correct: '1' },
      { id: 2, text: "How many cats? 🐱🐱", options: [{id:'1',label:'1'},{id:'2',label:'2'},{id:'3',label:'3'}], correct: '2' },
      { id: 3, text: "Count the stars: ⭐⭐⭐", options: [{id:'2',label:'2'},{id:'3',label:'3'},{id:'4',label:'4'}], correct: '3' },
      { id: 4, text: "How many balloons? 🎈🎈🎈🎈", options: [{id:'3',label:'3'},{id:'4',label:'4'},{id:'5',label:'5'}], correct: '4' },
      { id: 5, text: "Count the flowers: 🌼🌼", options: [{id:'1',label:'1'},{id:'2',label:'2'},{id:'3',label:'3'}], correct: '2' },
      { id: 6, text: "How many suns in the sky?", options: [{id:'0',label:'0'},{id:'1',label:'1'},{id:'2',label:'2'}], correct: '1' },
      { id: 7, text: "Count the birds: 🐦🐦🐦", options: [{id:'2',label:'2'},{id:'3',label:'3'},{id:'4',label:'4'}], correct: '3' },
      { id: 8, text: "How many legs on a dog?", options: [{id:'2',label:'2'},{id:'4',label:'4'},{id:'6',label:'6'}], correct: '4' },
      { id: 9, text: "Count the wheels on a tricycle", options: [{id:'2',label:'2'},{id:'3',label:'3'},{id:'4',label:'4'}], correct: '3' },
      { id: 10, text: "How many fingers on one hand?", options: [{id:'4',label:'4'},{id:'5',label:'5'},{id:'6',label:'6'}], correct: '5' },
      { id: 11, text: "Count the moons: 🌝🌝", options: [{id:'1',label:'1'},{id:'2',label:'2'},{id:'3',label:'3'}], correct: '2' },
      { id: 12, text: "How many noses on a rabbit?", options: [{id:'1',label:'1'},{id:'2',label:'2'},{id:'3',label:'3'}], correct: '1' },
      { id: 13, text: "Count the leaves: 🍃🍃🍃🍃🍃", options: [{id:'4',label:'4'},{id:'5',label:'5'},{id:'6',label:'6'}], correct: '5' },
      { id: 14, text: "How many ears on a cat?", options: [{id:'2',label:'2'},{id:'4',label:'4'},{id:'6',label:'6'}], correct: '2' },
      { id: 15, text: "Count the fish: 🐟🐟🐟", options: [{id:'2',label:'2'},{id:'3',label:'3'},{id:'4',label:'4'}], correct: '3' },
      { id: 16, text: "How many days in a week?", options: [{id:'5',label:'5'},{id:'6',label:'6'},{id:'7',label:'7'}], correct: '7' },
      { id: 17, text: "Count the stars: ⭐⭐⭐⭐", options: [{id:'3',label:'3'},{id:'4',label:'4'},{id:'5',label:'5'}], correct: '4' },
      { id: 18, text: "How many wings on a bird?", options: [{id:'2',label:'2'},{id:'4',label:'4'},{id:'6',label:'6'}], correct: '2' },
      { id: 19, text: "Count the clouds: ☁️☁️☁️", options: [{id:'2',label:'2'},{id:'3',label:'3'},{id:'4',label:'4'}], correct: '3' },
      { id: 20, text: "How many months in a year?", options: [{id:'10',label:'10'},{id:'12',label:'12'},{id:'14',label:'14'}], correct: '12' },
    ]
  },
  {
    name: "Level 2",
    questions: [
      { id: 21, text: "5 + 2 = ?", options: [{id:'6',label:'6'},{id:'7',label:'7'},{id:'8',label:'8'}], correct: '7' },
      { id: 22, text: "You have 3 cookies. You eat 1. How many left?", options: [{id:'1',label:'1'},{id:'2',label:'2'},{id:'3',label:'3'}], correct: '2' },
      { id: 23, text: "Count the apples: 🍎🍎 + 🍎🍎🍎 = ?", options: [{id:'4',label:'4'},{id:'5',label:'5'},{id:'6',label:'6'}], correct: '5' },
      { id: 24, text: "How many legs on 2 cats?", options: [{id:'6',label:'6'},{id:'8',label:'8'},{id:'10',label:'10'}], correct: '8' },
      { id: 25, text: "7 - 3 = ?", options: [{id:'3',label:'3'},{id:'4',label:'4'},{id:'5',label:'5'}], correct: '4' },
      { id: 26, text: "How many corners does a square have?", options: [{id:'3',label:'3'},{id:'4',label:'4'},{id:'5',label:'5'}], correct: '4' },
      { id: 27, text: "Count by 2s: 2, 4, 6, _", options: [{id:'7',label:'7'},{id:'8',label:'8'},{id:'9',label:'9'}], correct: '8' },
      { id: 28, text: "How many wheels on 3 cars?", options: [{id:'8',label:'8'},{id:'10',label:'10'},{id:'12',label:'12'}], correct: '12' },
      { id: 29, text: "9 - 4 = ?", options: [{id:'4',label:'4'},{id:'5',label:'5'},{id:'6',label:'6'}], correct: '5' },
      { id: 30, text: "There are 4 birds. 2 fly away. How many left?", options: [{id:'1',label:'1'},{id:'2',label:'2'},{id:'3',label:'3'}], correct: '2' },
      { id: 31, text: "3 + 6 = ?", options: [{id:'8',label:'8'},{id:'9',label:'9'},{id:'10',label:'10'}], correct: '9' },
      { id: 32, text: "How many legs on 2 spiders? (spider has 8 legs)", options: [{id:'12',label:'12'},{id:'14',label:'14'},{id:'16',label:'16'}], correct: '16' },
      { id: 33, text: "10 - 5 = ?", options: [{id:'4',label:'4'},{id:'5',label:'5'},{id:'6',label:'6'}], correct: '5' },
      { id: 34, text: "How many fingers on two hands?", options: [{id:'8',label:'8'},{id:'10',label:'10'},{id:'12',label:'12'}], correct: '10' },
      { id: 35, text: "Count the stars: ⭐⭐⭐ + ⭐⭐ = ?", options: [{id:'4',label:'4'},{id:'5',label:'5'},{id:'6',label:'6'}], correct: '5' },
      { id: 36, text: "4 + 5 = ?", options: [{id:'8',label:'8'},{id:'9',label:'9'},{id:'10',label:'10'}], correct: '9' },
      { id: 37, text: "You have 8 candies. You eat 3. How many left?", options: [{id:'4',label:'4'},{id:'5',label:'5'},{id:'6',label:'6'}], correct: '5' },
      { id: 38, text: "How many sides does a hexagon have?", options: [{id:'5',label:'5'},{id:'6',label:'6'},{id:'7',label:'7'}], correct: '6' },
      { id: 39, text: "6 + 7 = ?", options: [{id:'12',label:'12'},{id:'13',label:'13'},{id:'14',label:'14'}], correct: '13' },
      { id: 40, text: "How many eggs in a dozen?", options: [{id:'10',label:'10'},{id:'12',label:'12'},{id:'14',label:'14'}], correct: '12' },
    ]
  },
  {
    name: "Level 3",
    questions: [
      { id: 41, text: "15 + 7 = ?", options: [{id:'21',label:'21'},{id:'22',label:'22'},{id:'23',label:'23'}], correct: '22' },
      { id: 42, text: "How many legs on 3 chickens and 2 cows?", options: [{id:'14',label:'14'},{id:'16',label:'16'},{id:'18',label:'18'}], correct: '16' },
      { id: 43, text: "20 - 8 = ?", options: [{id:'10',label:'10'},{id:'11',label:'11'},{id:'12',label:'12'}], correct: '12' },
      { id: 44, text: "Count by 5s: 5, 10, 15, _", options: [{id:'18',label:'18'},{id:'20',label:'20'},{id:'25',label:'25'}], correct: '20' },
      { id: 45, text: "If you have 24 pencils and give half away, how many left?", options: [{id:'10',label:'10'},{id:'12',label:'12'},{id:'14',label:'14'}], correct: '12' },
      { id: 46, text: "9 × 3 = ?", options: [{id:'24',label:'24'},{id:'27',label:'27'},{id:'30',label:'30'}], correct: '27' },
      { id: 47, text: "How many minutes in an hour?", options: [{id:'50',label:'50'},{id:'60',label:'60'},{id:'70',label:'70'}], correct: '60' },
      { id: 48, text: "18 - 9 = ?", options: [{id:'7',label:'7'},{id:'8',label:'8'},{id:'9',label:'9'}], correct: '9' },
      { id: 49, text: "Count backwards from 20 to 15: 20, 19, 18, 17, ?", options: [{id:'15',label:'15'},{id:'16',label:'16'},{id:'14',label:'14'}], correct: '16' },
      { id: 50, text: "How many corners on a cube?", options: [{id:'6',label:'6'},{id:'8',label:'8'},{id:'12',label:'12'}], correct: '8' },
      { id: 51, text: "36 ÷ 6 = ?", options: [{id:'5',label:'5'},{id:'6',label:'6'},{id:'7',label:'7'}], correct: '6' },
      { id: 52, text: "There are 30 students. 13 are boys. How many girls?", options: [{id:'15',label:'15'},{id:'17',label:'17'},{id:'19',label:'19'}], correct: '17' },
      { id: 53, text: "14 + 19 = ?", options: [{id:'31',label:'31'},{id:'32',label:'32'},{id:'33',label:'33'}], correct: '33' },
      { id: 54, text: "How many sides does an octagon have?", options: [{id:'6',label:'6'},{id:'7',label:'7'},{id:'8',label:'8'}], correct: '8' },
      { id: 55, text: "25 - 12 = ?", options: [{id:'11',label:'11'},{id:'12',label:'12'},{id:'13',label:'13'}], correct: '13' },
      { id: 56, text: "How many hours in a day?", options: [{id:'12',label:'12'},{id:'24',label:'24'},{id:'36',label:'36'}], correct: '24' },
      { id: 57, text: "8 × 7 = ?", options: [{id:'54',label:'54'},{id:'56',label:'56'},{id:'58',label:'58'}], correct: '56' },
      { id: 58, text: "You have 45 candies. You share equally among 5 friends. Each gets?", options: [{id:'7',label:'7'},{id:'8',label:'8'},{id:'9',label:'9'}], correct: '9' },
      { id: 59, text: "Count by 3s: 3, 6, 9, 12, ?", options: [{id:'14',label:'14'},{id:'15',label:'15'},{id:'16',label:'16'}], correct: '15' },
      { id: 60, text: "How many seconds in a minute?", options: [{id:'30',label:'30'},{id:'60',label:'60'},{id:'100',label:'100'}], correct: '60' },
    ]
  },
  {
    name: "Level 4",
    questions: [
      { id: 61, text: "125 - 87 = ?", options: [{id:'36',label:'36'},{id:'38',label:'38'},{id:'40',label:'40'}], correct: '38' },
      { id: 62, text: "How many legs on 4 spiders and 2 birds?", options: [{id:'36',label:'36'},{id:'38',label:'38'},{id:'40',label:'40'}], correct: '36' },
      { id: 63, text: "42 + 39 = ?", options: [{id:'79',label:'79'},{id:'81',label:'81'},{id:'83',label:'83'}], correct: '81' },
      { id: 64, text: "What is 3/4 of 20?", options: [{id:'15',label:'15'},{id:'16',label:'16'},{id:'17',label:'17'}], correct: '15' },
      { id: 65, text: "Count by 6s: 6, 12, 18, 24, ?", options: [{id:'28',label:'28'},{id:'30',label:'30'},{id:'32',label:'32'}], correct: '30' },
      { id: 66, text: "A box contains 48 chocolates. You eat 12. How many left?", options: [{id:'34',label:'34'},{id:'36',label:'36'},{id:'38',label:'38'}], correct: '36' },
      { id: 67, text: "15 × 6 = ?", options: [{id:'80',label:'80'},{id:'90',label:'90'},{id:'100',label:'100'}], correct: '90' },
      { id: 68, text: "How many edges on a cube?", options: [{id:'8',label:'8'},{id:'10',label:'10'},{id:'12',label:'12'}], correct: '12' },
      { id: 69, text: "144 ÷ 12 = ?", options: [{id:'10',label:'10'},{id:'11',label:'11'},{id:'12',label:'12'}], correct: '12' },
      { id: 70, text: "If a train leaves at 3:15 and arrives at 5:45, how many minutes?", options: [{id:'120',label:'120'},{id:'150',label:'150'},{id:'180',label:'180'}], correct: '150' },
      { id: 71, text: "50 - 27 = ?", options: [{id:'21',label:'21'},{id:'23',label:'23'},{id:'25',label:'25'}], correct: '23' },
      { id: 72, text: "How many centimeters in a meter?", options: [{id:'10',label:'10'},{id:'100',label:'100'},{id:'1000',label:'1000'}], correct: '100' },
      { id: 73, text: "23 + 48 = ?", options: [{id:'69',label:'69'},{id:'71',label:'71'},{id:'73',label:'73'}], correct: '71' },
      { id: 74, text: "Count by 7s: 7, 14, 21, 28, ?", options: [{id:'34',label:'34'},{id:'35',label:'35'},{id:'36',label:'36'}], correct: '35' },
      { id: 75, text: "How many faces on a square pyramid?", options: [{id:'4',label:'4'},{id:'5',label:'5'},{id:'6',label:'6'}], correct: '5' },
      { id: 76, text: "64 ÷ 8 = ?", options: [{id:'6',label:'6'},{id:'7',label:'7'},{id:'8',label:'8'}], correct: '8' },
      { id: 77, text: "You have 3 dozen eggs. You use 15. How many left?", options: [{id:'19',label:'19'},{id:'21',label:'21'},{id:'23',label:'23'}], correct: '21' },
      { id: 78, text: "9 × 12 = ?", options: [{id:'102',label:'102'},{id:'108',label:'108'},{id:'114',label:'114'}], correct: '108' },
      { id: 79, text: "How many minutes in a quarter hour?", options: [{id:'15',label:'15'},{id:'20',label:'20'},{id:'25',label:'25'}], correct: '15' },
      { id: 80, text: "81 - 45 = ?", options: [{id:'34',label:'34'},{id:'36',label:'36'},{id:'38',label:'38'}], correct: '36' },
    ]
  },
  {
    name: "Level 5",
    questions: [
      { id: 81, text: "56 × 7 = ?", options: [{id:'372',label:'372'},{id:'392',label:'392'},{id:'412',label:'412'}], correct: '392' },
      { id: 82, text: "How many legs on 5 octopuses (8 legs) and 3 crabs (10 legs)?", options: [{id:'70',label:'70'},{id:'72',label:'72'},{id:'74',label:'74'}], correct: '70' },
      { id: 83, text: "1440 ÷ 12 = ?", options: [{id:'110',label:'110'},{id:'120',label:'120'},{id:'130',label:'130'}], correct: '120' },
      { id: 84, text: "What is 3/5 of 75?", options: [{id:'45',label:'45'},{id:'50',label:'50'},{id:'55',label:'55'}], correct: '45' },
      { id: 85, text: "Count by 8s: 8, 16, 24, 32, 40, ?", options: [{id:'44',label:'44'},{id:'48',label:'48'},{id:'52',label:'52'}], correct: '48' },
      { id: 86, text: "How many seconds in 2 hours?", options: [{id:'3600',label:'3600'},{id:'7200',label:'7200'},{id:'14400',label:'14400'}], correct: '7200' },
      { id: 87, text: "108 - 59 = ?", options: [{id:'47',label:'47'},{id:'49',label:'49'},{id:'51',label:'51'}], correct: '49' },
      { id: 88, text: "How many vertices on a triangular prism?", options: [{id:'4',label:'4'},{id:'6',label:'6'},{id:'8',label:'8'}], correct: '6' },
      { id: 89, text: "25 × 18 = ?", options: [{id:'430',label:'430'},{id:'450',label:'450'},{id:'470',label:'470'}], correct: '450' },
      { id: 90, text: "A tank holds 500 litres. If you pour 3/4 of it, how much left?", options: [{id:'100',label:'100'},{id:'125',label:'125'},{id:'150',label:'150'}], correct: '125' },
      { id: 91, text: "144 + 256 = ?", options: [{id:'400',label:'400'},{id:'410',label:'410'},{id:'420',label:'420'}], correct: '400' },
      { id: 92, text: "How many days in a leap year?", options: [{id:'365',label:'365'},{id:'366',label:'366'},{id:'367',label:'367'}], correct: '366' },
      { id: 93, text: "78 ÷ 6 = ?", options: [{id:'11',label:'11'},{id:'12',label:'12'},{id:'13',label:'13'}], correct: '13' },
      { id: 94, text: "What is 2/3 of 90?", options: [{id:'50',label:'50'},{id:'60',label:'60'},{id:'70',label:'70'}], correct: '60' },
      { id: 95, text: "Count by 9s: 9, 18, 27, 36, 45, ?", options: [{id:'52',label:'52'},{id:'54',label:'54'},{id:'56',label:'56'}], correct: '54' },
      { id: 96, text: "How many edges on a square pyramid?", options: [{id:'6',label:'6'},{id:'8',label:'8'},{id:'10',label:'10'}], correct: '8' },
      { id: 97, text: "17 × 12 = ?", options: [{id:'194',label:'194'},{id:'204',label:'204'},{id:'214',label:'214'}], correct: '204' },
      { id: 98, text: "You have 120 stamps. You give 25 to your friend and buy 30 more. How many now?", options: [{id:'115',label:'115'},{id:'125',label:'125'},{id:'135',label:'135'}], correct: '125' },
      { id: 99, text: "What is the average of 14, 18, 22?", options: [{id:'16',label:'16'},{id:'18',label:'18'},{id:'20',label:'20'}], correct: '18' },
      { id: 100, text: "How many millimeters in 3.5 cm?", options: [{id:'30',label:'30'},{id:'35',label:'35'},{id:'40',label:'40'}], correct: '35' },
    ]
  },
  {
    name: "Level 6",
    questions: [
      { id: 101, text: "What is 15% of 200?", options: [{id:'20',label:'20'},{id:'30',label:'30'},{id:'40',label:'40'}], correct: '30' },
      { id: 102, text: "How many ways can you make change for $1 using coins? (approx)", options: [{id:'293',label:'293'},{id:'294',label:'294'},{id:'295',label:'295'}], correct: '293' },
      { id: 103, text: "If a shirt costs $45 after a 10% discount, what was the original price?", options: [{id:'50',label:'50'},{id:'55',label:'55'},{id:'60',label:'60'}], correct: '50' },
      { id: 104, text: "How many diagonals does a decagon have?", options: [{id:'35',label:'35'},{id:'40',label:'40'},{id:'45',label:'45'}], correct: '35' },
      { id: 105, text: "The sum of two numbers is 24 and their product is 135. Find the numbers.", options: [{id:'9&15',label:'9 and 15'},{id:'10&14',label:'10 and 14'},{id:'11&13',label:'11 and 13'}], correct: '9&15' },
      { id: 106, text: "What is the square root of 196?", options: [{id:'12',label:'12'},{id:'14',label:'14'},{id:'16',label:'16'}], correct: '14' },
      { id: 107, text: "How many seconds in a day?", options: [{id:'86400',label:'86,400'},{id:'8640',label:'8,640'},{id:'864000',label:'864,000'}], correct: '86400' },
      { id: 108, text: "A snail climbs 3 ft per day and slips 2 ft per night. How many days to reach a 10 ft wall?", options: [{id:'7',label:'7'},{id:'8',label:'8'},{id:'9',label:'9'}], correct: '8' },
      { id: 109, text: "What is 7! (7 factorial)?", options: [{id:'5040',label:'5040'},{id:'720',label:'720'},{id:'40320',label:'40320'}], correct: '5040' },
      { id: 110, text: "How many edges on an icosahedron?", options: [{id:'20',label:'20'},{id:'30',label:'30'},{id:'40',label:'40'}], correct: '30' },
      { id: 111, text: "A rectangle has length 12 and diagonal 13. What is the width?", options: [{id:'5',label:'5'},{id:'6',label:'6'},{id:'7',label:'7'}], correct: '5' },
      { id: 112, text: "What is 2^10?", options: [{id:'1024',label:'1024'},{id:'512',label:'512'},{id:'2048',label:'2048'}], correct: '1024' },
      { id: 113, text: "How many prime numbers between 1 and 50?", options: [{id:'15',label:'15'},{id:'16',label:'16'},{id:'17',label:'17'}], correct: '15' },
      { id: 114, text: "If you roll two dice, probability of sum 7?", options: [{id:'1/6',label:'1/6'},{id:'1/8',label:'1/8'},{id:'1/12',label:'1/12'}], correct: '1/6' },
      { id: 115, text: "What is the next number in the Fibonacci sequence after 34?", options: [{id:'55',label:'55'},{id:'56',label:'56'},{id:'57',label:'57'}], correct: '55' },
      { id: 116, text: "How many faces does a dodecahedron have?", options: [{id:'10',label:'10'},{id:'12',label:'12'},{id:'20',label:'20'}], correct: '12' },
      { id: 117, text: "A car travels 60 miles in 1.5 hours. What is its average speed in mph?", options: [{id:'40',label:'40'},{id:'50',label:'50'},{id:'60',label:'60'}], correct: '40' },
      { id: 118, text: "What is the cube root of 729?", options: [{id:'7',label:'7'},{id:'8',label:'8'},{id:'9',label:'9'}], correct: '9' },
      { id: 119, text: "How many zeroes in one billion (US)?", options: [{id:'9',label:'9'},{id:'10',label:'10'},{id:'11',label:'11'}], correct: '9' },
      { id: 120, text: "What is the Roman numeral for 1999?", options: [{id:'MCMXCIX',label:'MCMXCIX'},{id:'MCMXCVIII',label:'MCMXCVIII'},{id:'MCMXCIX',label:'MCMXCIX'}], correct: 'MCMXCIX' },
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
export default function CountingScreen() {
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
      const saved = await AsyncStorage.getItem('counting_highScore');
      if (saved) setHighScore(parseInt(saved));
    } catch (e) {}
  };

  const saveHighScore = async (newScore) => {
    if (newScore > highScore) {
      setHighScore(newScore);
      await AsyncStorage.setItem('counting_highScore', newScore.toString());
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
          <Text style={[styles.loadingEmoji, { fontSize: fontSize.xlarge * 2 }]}>🔢🧮</Text>
        </Animated.View>
        <Text style={[styles.loadingText, { fontSize: fontSize.large }]}>Loading Counting Game...</Text>
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
        <Text style={[styles.welcomeTitle, { fontSize: fontSize.xlarge }]}>🔢 Counting Game</Text>
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