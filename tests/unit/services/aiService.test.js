import { describe, it, expect } from 'vitest';
import { 
  sendMessageToAI, 
  parseOBDCode, 
  analyzeAcousticNoise, 
  generateSaleAd 
} from '../../../src/services/aiService.js';

describe('AI Service Unit Tests', () => {
  const mockCar = {
    make: 'Lada',
    model: 'Granta',
    year: 2017,
    currentMileage: 85200,
    specs: { hp: 87 }
  };

  describe('sendMessageToAI', () => {
    it('Matches OBD responses from mockData', async () => {
      const respP0300 = await sendMessageToAI('P0300 code found');
      expect(respP0300).toContain('random or multiple cylinder misfire');

      const respP0420 = await sendMessageToAI('P0420');
      expect(respP0420).toContain('catalytic converter efficiency');

      const respP0113 = await sendMessageToAI('Tell me about P0113');
      expect(respP0113).toContain('Intake Air Temperature');
    });

    it('Matches mileage query response', async () => {
      const resp = await sendMessageToAI('How to improve my mileage?');
      expect(resp).toContain('tyres are properly inflated');
    });

    it('Matches brake/squeal query with carProfile context', async () => {
      const resp = await sendMessageToAI('My brakes are squealing', [], mockCar);
      expect(resp).toContain('For your 2017 Lada Granta (85200 km)');
      expect(resp).toContain('squealing brakes usually indicate worn brake pads');
    });

    it('Matches oil/lubricant query with carProfile context', async () => {
      const resp = await sendMessageToAI('When to change oil?', [], mockCar);
      expect(resp).toContain('85200 km');
      expect(resp).toContain('engine oil changes should typically happen');
    });

    it('Matches noise/knock query with carProfile context', async () => {
      const resp = await sendMessageToAI('Engine knock sound', [], mockCar);
      expect(resp).toContain('knocking sound from the engine could indicate');
    });

    it('Matches history/records query using history length', async () => {
      const history = [{ id: 1 }, { id: 2 }];
      const resp = await sendMessageToAI('Show my records', history);
      expect(resp).toContain('currently have 2 service logs registered');
    });

    it('Uses fallback response', async () => {
      const resp = await sendMessageToAI('Hello developer', [], mockCar);
      expect(resp).toContain('analyzing that query');
    });
  });

  describe('parseOBDCode', () => {
    it('Parses valid codes correctly', () => {
      const res = parseOBDCode('P0300');
      expect(res.code).toBe('P0300');
      expect(res.description).toContain('Cylinder Misfire');

      const res2 = parseOBDCode('  p0420  ');
      expect(res2.code).toBe('P0420');
    });

    it('Throws error for invalid or unknown OBD codes', () => {
      expect(() => parseOBDCode('P9999')).toThrow('Unknown fault code. Please check code format');
      expect(() => parseOBDCode('INVALID')).toThrow('Unknown fault code. Please check code format');
      expect(() => parseOBDCode(null)).toThrow('Unknown fault code. Please check code format');
    });
  });

  describe('analyzeAcousticNoise', () => {
    it('Analyzes knock files correctly', async () => {
      const res = await analyzeAcousticNoise('engine_knock.mp3');
      expect(res.diagnosis).toContain('Severe rod knock');
      expect(res.confidence).toBe(0.92);
    });

    it('Analyzes squeal files correctly', async () => {
      const res = await analyzeAcousticNoise('belt_squeal.wav');
      expect(res.diagnosis).toContain('Serpentine accessory drive belt');
      expect(res.confidence).toBe(0.85);
    });

    it('Handles unknown noises', async () => {
      const res = await analyzeAcousticNoise({ name: 'random_noise.m4a' });
      expect(res.diagnosis).toContain('Acoustic sample inconclusive');
    });

    it('Throws validation error for invalid formats', async () => {
      await expect(analyzeAcousticNoise('test.txt')).rejects.toThrow('Supported audio formats: MP3, WAV, M4A only');
      await expect(analyzeAcousticNoise(null)).rejects.toThrow('Supported audio formats: MP3, WAV, M4A only');
    });
  });

  describe('generateSaleAd', () => {
    it('Generates sale ad for Lada Granta', () => {
      const ad = generateSaleAd(mockCar);
      expect(ad).toContain('Lada Granta');
      expect(ad).toContain('85,200');
    });

    it('Generates sale ad for VW Jetta', () => {
      const ad = generateSaleAd({ make: 'Volkswagen', model: 'Jetta', currentMileage: 62000 });
      expect(ad).toContain('Volkswagen Jetta');
      expect(ad).toContain('62,000');
    });

    it('Generates fallback ad for other active vehicle profiles', () => {
      const ad = generateSaleAd({ make: 'Ford', model: 'Focus', year: 2015, currentMileage: 120000, specs: { hp: 125 } });
      expect(ad).toContain('For Sale: 2015 Ford Focus');
      expect(ad).toContain('120');
      expect(ad).toContain('000');
    });

    it('Throws error if car profile is empty', () => {
      expect(() => generateSaleAd(null)).toThrow('Please create a vehicle profile first to generate a sales ad');
      expect(() => generateSaleAd({})).toThrow('Please create a vehicle profile first to generate a sales ad');
    });
  });
});
