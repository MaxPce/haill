// src/utils/formatIdSport.js
export const formatIdSport = (number) => {
  const mapping = {
    // ---> Fútbol
    5: 1,
    42: 1,
    52: 1,
    53: 1,
    117: 1,
    118: 1,
    119: 1,
    120: 1,
    121: 1,
    122: 1,
    // ---> Futsal
    6: 2,
    7: 2,
    109: 2,
    110: 2,
    // ---> Voleyball
    16: 3,
    17: 3,
    54: 3,
    55: 3,
    44: 3,
    45: 3,
    100: 3,
    101: 3,
    102: 3,
    103: 3,
    104: 3,
    113: 3,
    114: 3,
    115: 3,
    116: 3,
    999: 3,
    // ---> Basquetball
    3: 4,
    4: 4,
    105: 4,
    106: 4,
    107: 4,
    108: 4,
    500: 4,
    501: 4,
    502: 4,
    503: 4,
    504: 4,
    505: 4,
    506: 4,
    // ---> Handball
    50: 5,
    51: 5,
    61: 5,
    62: 5,
    111: 5,
    112: 5,
    // ---> Rugby
    56: 6,
    57: 6,
  };

  return mapping[number] || null;
};


// idsport
// 5 42 -> Fútbol 1
// 52 53 -> Fútbol 1

// 6 7 -> Futsal 2

// 16 17 -> Voleibol 3
// 54 55 -> Voleibol 3

// 3 4 -> Basquetbol 4

// 50 51 -> Handball 5
