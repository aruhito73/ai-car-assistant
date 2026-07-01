import { describe, it, expect } from 'vitest';
import { recognizeSTS, recognizeDashboard } from '../../../src/services/ocrService.js';

describe('OCR Simulator Service Unit Tests', () => {

  describe('recognizeSTS', () => {
    it('should successfully extract VIN from string file name containing "sts"', async () => {
      const result = await recognizeSTS('tests/e2e/fixtures/assets/sts_card.png');
      expect(result).toEqual({ vin: 'XTA219000H1234567' });
    });

    it('should successfully extract VIN from a mock File object containing "sts"', async () => {
      const fileMock = { name: 'sts_card.jpg' };
      const result = await recognizeSTS(fileMock);
      expect(result).toEqual({ vin: 'XTA219000H1234567' });
    });

    it('should extract VW Jetta VIN if filename contains "jetta"', async () => {
      const result = await recognizeSTS('sts_jetta.jpeg');
      expect(result).toEqual({ vin: '3VW2K7AJ0HM123456' });
    });

    it('should directly extract a 17-character VIN from the filename if present', async () => {
      const result = await recognizeSTS('my_car_3VW2K7AJ0HM123456.jpg');
      expect(result).toEqual({ vin: '3VW2K7AJ0HM123456' });
    });

    it('should throw an error for unsupported file formats (e.g., .txt)', async () => {
      await expect(recognizeSTS('dummy.txt')).rejects.toThrow(
        'Supported formats: PNG, JPG, JPEG only. Parsing failed.'
      );
    });

    it('should throw an error if the filename has a valid extension but does not contain "sts" or a VIN', async () => {
      await expect(recognizeSTS('random_dashboard.jpg')).rejects.toThrow(
        'Supported formats: PNG, JPG, JPEG only. Parsing failed.'
      );
    });

    it('should prevent path false-positives by only matching the filename (e.g. directory has "sts" but filename does not)', async () => {
      await expect(recognizeSTS('/some/sts/path/random.jpg')).rejects.toThrow(
        'Supported formats: PNG, JPG, JPEG only. Parsing failed.'
      );
    });

    it('should successfully extract VIN from a path containing tests folder like C:\\\\tests\\\\sts_card.png', async () => {
      const result = await recognizeSTS('C:\\tests\\sts_card.png');
      expect(result).toEqual({ vin: 'XTA219000H1234567' });
    });

    it('should reject a path containing tests folder but not sts in filename like C:\\\\tests\\\\odometer_dash.jpg as STS card', async () => {
      await expect(recognizeSTS('C:\\tests\\odometer_dash.jpg')).rejects.toThrow(
        'Supported formats: PNG, JPG, JPEG only. Parsing failed.'
      );
    });

    it('should throw an error if no file or invalid parameter is provided', async () => {
      await expect(recognizeSTS(null)).rejects.toThrow(
        'Supported formats: PNG, JPG, JPEG only. Parsing failed.'
      );
      await expect(recognizeSTS(undefined)).rejects.toThrow(
        'Supported formats: PNG, JPG, JPEG only. Parsing failed.'
      );
    });
  });

  describe('recognizeDashboard', () => {
    it('should successfully extract mileage from string file name containing "odometer"', async () => {
      const result = await recognizeDashboard('tests/e2e/fixtures/assets/odometer_dash.jpg');
      expect(result).toEqual({ mileage: 85200 });
    });

    it('should successfully extract mileage from a mock File object containing "odometer"', async () => {
      const fileMock = { name: 'my_odometer.png' };
      const result = await recognizeDashboard(fileMock);
      expect(result).toEqual({ mileage: 85200 });
    });

    it('should extract VW Jetta mileage if filename contains "jetta"', async () => {
      const result = await recognizeDashboard('odometer_jetta.jpeg');
      expect(result).toEqual({ mileage: 62000 });
    });

    it('should directly extract mileage digits from the filename if present', async () => {
      const result = await recognizeDashboard('dashboard-12345.png');
      expect(result).toEqual({ mileage: 12345 });
    });

    it('should extract mileage digits from the filename even if they are adjacent to underscores', async () => {
      const result = await recognizeDashboard('dashboard_12345.png');
      expect(result).toEqual({ mileage: 12345 });
    });

    it('should throw an error for unsupported file formats (e.g., .txt)', async () => {
      await expect(recognizeDashboard('dummy.txt')).rejects.toThrow(
        'Supported formats: PNG, JPG, JPEG only. Parsing failed.'
      );
    });

    it('should throw an error if the filename has a valid extension but does not contain "odometer" or mileage digits', async () => {
      await expect(recognizeDashboard('sts_card.png')).rejects.toThrow(
        'Supported formats: PNG, JPG, JPEG only. Parsing failed.'
      );
    });

    it('should successfully extract mileage from a path containing tests folder like C:\\\\tests\\\\odometer_dash.jpg', async () => {
      const result = await recognizeDashboard('C:\\tests\\odometer_dash.jpg');
      expect(result).toEqual({ mileage: 85200 });
    });

    it('should reject a path containing tests folder but not odometer in filename like C:\\\\tests\\\\sts_card.png as dashboard', async () => {
      await expect(recognizeDashboard('C:\\tests\\sts_card.png')).rejects.toThrow(
        'Supported formats: PNG, JPG, JPEG only. Parsing failed.'
      );
    });

    it('should throw an error if no file or invalid parameter is provided', async () => {
      await expect(recognizeDashboard(null)).rejects.toThrow(
        'Supported formats: PNG, JPG, JPEG only. Parsing failed.'
      );
      await expect(recognizeDashboard(undefined)).rejects.toThrow(
        'Supported formats: PNG, JPG, JPEG only. Parsing failed.'
      );
    });
  });

});
