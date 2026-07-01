/**
 * AI Service for Copilot and Diagnostics
 */

import { mockData } from '../../tests/e2e/fixtures/mockData.js';

/**
 * Simulates AI chatbot logic.
 * @param {string} message 
 * @param {Array} history 
 * @param {object} carProfile 
 * @returns {Promise<string>}
 */
export async function sendMessageToAI(message, history = [], carProfile = null) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const lowercaseQuery = message.toLowerCase();
      const carContextString = carProfile 
        ? `For your ${carProfile.year} ${carProfile.make} ${carProfile.model} (${carProfile.currentMileage} km), ` 
        : '';

      let replyText = '';

      if (lowercaseQuery.includes('p0300')) {
        replyText = mockData.aiChat.obdResponses.P0300;
      } else if (lowercaseQuery.includes('p0420')) {
        replyText = mockData.aiChat.obdResponses.P0420;
      } else if (lowercaseQuery.includes('p0113')) {
        replyText = mockData.aiChat.obdResponses.P0113;
      } else if (lowercaseQuery.includes('mileage') || lowercaseQuery.includes('efficiency')) {
        replyText = mockData.aiChat.generalQuestions.mileage;
      } else if (lowercaseQuery.includes('brake') || lowercaseQuery.includes('squeal')) {
        replyText = `${carContextString}squealing brakes usually indicate worn brake pads. The wear indicators (small metal tabs) scratch the rotor to warn you. I recommend inspecting pad thickness; if it's less than 3mm, replacement is urgent.`;
      } else if (lowercaseQuery.includes('oil') || lowercaseQuery.includes('lubricant')) {
        replyText = `${carContextString}engine oil changes should typically happen every 7,500 to 10,000 km (or every 6-12 months). Since your mileage is ${carProfile?.currentMileage || 'N/A'} km, check if you have logged an oil change recently in the Service Book.`;
      } else if (lowercaseQuery.includes('noise') || lowercaseQuery.includes('knock')) {
        replyText = `${carContextString}a knocking sound from the engine could indicate low oil pressure, worn bearings, or fuel pre-ignition (spark knock). Check your engine oil dipstick immediately. If oil is full, do not drive the car to prevent catastrophic engine block damage.`;
      } else if (lowercaseQuery.includes('history') || lowercaseQuery.includes('records')) {
        const count = history ? history.length : 0;
        replyText = `I scanned your local records. You currently have ${count} service logs registered. Keeping track of regular services prevents major component failures down the road.`;
      } else {
        replyText = `${carContextString}I'm analyzing that query. For general maintenance, check your fluid levels (coolant, brake fluid, windshield washer) and ensure no warning lights are active on the dashboard. Tell me more details about any codes or issues you're facing!`;
      }

      resolve(replyText);
    }, 100);
  });
}

/**
 * Validates and parses a standard 5-digit OBD code.
 * @param {string} code 
 * @returns {object} OBD code details
 */
export function parseOBDCode(code) {
  if (!code || typeof code !== 'string') {
    throw new Error("Unknown fault code. Please check code format");
  }
  const cleanCode = code.trim().toUpperCase();
  if (!/^[PBUC]\d{4}$/i.test(cleanCode)) {
    throw new Error("Unknown fault code. Please check code format");
  }
  const matched = mockData.obdCodes[cleanCode];
  if (!matched) {
    throw new Error("Unknown fault code. Please check code format");
  }
  return matched;
}

/**
 * Simulates acoustic noise diagnostics.
 * @param {File|string} audioFile 
 * @returns {Promise<object>} Acoustic diagnosis results
 */
export async function analyzeAcousticNoise(audioFile) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        if (!audioFile) {
          throw new Error("Supported audio formats: MP3, WAV, M4A only");
        }
        let filename = "";
        if (typeof audioFile === 'string') {
          filename = audioFile;
        } else if (audioFile && typeof audioFile === 'object') {
          filename = audioFile.name || "";
        }
        
        if (!filename) {
          throw new Error("Supported audio formats: MP3, WAV, M4A only");
        }

        const ext = filename.split('.').pop().toLowerCase();
        if (!['mp3', 'wav', 'm4a'].includes(ext)) {
          throw new Error("Supported audio formats: MP3, WAV, M4A only");
        }

        let key = 'unknownNoise';
        const lowerFilename = filename.toLowerCase();
        if (lowerFilename.includes('knock')) {
          key = 'engineKnock';
        } else if (lowerFilename.includes('squeal') || lowerFilename.includes('belt')) {
          key = 'beltSqueal';
        }

        const diagnosis = mockData.acousticDiagnoses[key];
        if (diagnosis) {
          resolve(diagnosis);
        } else {
          resolve(mockData.acousticDiagnoses.unknownNoise);
        }
      } catch (error) {
        reject(error);
      }
    }, 100);
  });
}

/**
 * Generates a sales ad in Markdown.
 * @param {object} carProfile 
 * @param {Array} history 
 * @returns {string} Sales ad text
 */
export function generateSaleAd(carProfile, history = []) {
  if (!carProfile || Object.keys(carProfile).length === 0) {
    throw new Error("Please create a vehicle profile first to generate a sales ad");
  }
  
  const model = (carProfile.model || '').toLowerCase();
  const make = (carProfile.make || '').toLowerCase();

  if (make.includes('lada') || model.includes('granta')) {
    return mockData.saleAd.ladaGranta;
  } else if (make.includes('volkswagen') || make.includes('vw') || model.includes('jetta')) {
    return mockData.saleAd.vwJetta;
  } else {
    const trans = carProfile.transmission || 'Automatic';
    const mk = carProfile.make || 'Generic';
    const md = carProfile.model || 'Import';
    const yr = carProfile.year || 2020;
    const hp = carProfile.specs?.hp || 100;
    const mil = carProfile.currentMileage || 0;
    return `For Sale: ${yr} ${mk} ${md}. ${trans} transmission, engine with ${hp} HP. Current mileage is ${mil.toLocaleString()} km. Service history is documented. Great reliable vehicle!`;
  }
}
