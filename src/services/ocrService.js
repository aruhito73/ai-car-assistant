/**
 * OCR Scanner Simulator
 * Mimics vision parsing of image files for STS cards and odometer dashboards.
 */

const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg'];

/**
 * Validates the file format and extracts its normalized lower-case name.
 * Throws an error if the format is unsupported or file is invalid.
 * 
 * @param {File|string} imageFile 
 * @returns {string} normalized file name
 */
function validateImageFile(imageFile) {
  if (!imageFile) {
    throw new Error("Supported formats: PNG, JPG, JPEG only. Parsing failed.");
  }

  let fileName = "";
  if (typeof imageFile === 'string') {
    fileName = imageFile.trim();
  } else if (imageFile && typeof imageFile === 'object' && typeof imageFile.name === 'string') {
    fileName = imageFile.name.trim();
  } else {
    throw new Error("Supported formats: PNG, JPG, JPEG only. Parsing failed.");
  }

  const lowerName = fileName.toLowerCase();
  const hasValidExtension = ALLOWED_EXTENSIONS.some(ext => lowerName.endsWith(ext));

  if (!hasValidExtension) {
    throw new Error("Supported formats: PNG, JPG, JPEG only. Parsing failed.");
  }

  return lowerName;
}

/**
 * Simulates OCR recognition of an STS card.
 * Triggers on file name containing "sts" or "sts_card.png"
 * 
 * @param {File|string} imageFile 
 * @returns {Promise<{ vin: string }>}
 */
export async function recognizeSTS(imageFile) {
  return new Promise((resolve, reject) => {
    // Simulate slight network/processing delay (200ms)
    setTimeout(() => {
      try {
        const lowerName = validateImageFile(imageFile);
        const fileName = lowerName.split(/[/\\]/).pop().trim();
        
        // Search fileName for a 17-character valid VIN pattern
        const vinMatch = fileName.match(/[A-HJ-NPR-Z0-9]{17}/i);
        if (vinMatch) {
          resolve({ vin: vinMatch[0].toUpperCase() });
          return;
        }

        // Fall back to standard checks
        if (fileName.includes('sts')) {
          if (fileName.includes('jetta')) {
            resolve({ vin: '3VW2K7AJ0HM123456' });
          } else {
            resolve({ vin: 'XTA219000H1234567' });
          }
        } else {
          reject(new Error("Supported formats: PNG, JPG, JPEG only. Parsing failed."));
        }
      } catch (error) {
        reject(error);
      }
    }, 200);
  });
}

/**
 * Simulates OCR recognition of an odometer dashboard.
 * Triggers on file name containing "odometer" or "odometer_dash.jpg"
 * 
 * @param {File|string} imageFile 
 * @returns {Promise<{ mileage: number }>}
 */
export async function recognizeDashboard(imageFile) {
  return new Promise((resolve, reject) => {
    // Simulate slight network/processing delay (200ms)
    setTimeout(() => {
      try {
        const lowerName = validateImageFile(imageFile);
        const fileName = lowerName.split(/[/\\]/).pop().trim();
        
        // Search fileName for a mileage number matching /(?<=_|\b)\d{1,7}(?=_|\b)/
        const mileageMatch = fileName.match(/(?<=_|-|\b)\d{1,7}(?=_|-|\b)/);
        if (mileageMatch) {
          resolve({ mileage: parseInt(mileageMatch[0], 10) });
          return;
        }

        // Fall back to standard checks
        if (fileName.includes('odometer')) {
          if (fileName.includes('jetta')) {
            resolve({ mileage: 62000 });
          } else {
            resolve({ mileage: 85200 });
          }
        } else {
          reject(new Error("Supported formats: PNG, JPG, JPEG only. Parsing failed."));
        }
      } catch (error) {
        reject(error);
      }
    }, 200);
  });
}
