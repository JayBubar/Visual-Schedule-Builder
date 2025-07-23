// src/renderer/utils/photoManager.ts
// Photo upload and management utilities

export interface PhotoUploadResult {
  success: boolean;
  fileName?: string;
  dataUrl?: string;
  error?: string;
  size?: number;
}

export interface PhotoValidationResult {
  isValid: boolean;
  error?: string;
  suggestedFix?: string;
}

class PhotoManager {
  private maxFileSize = 5 * 1024 * 1024; // 5MB
  private allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  private compressionQuality = 0.8;
  private maxDimensions = { width: 800, height: 800 };

  /**
   * Validate uploaded photo file
   */
  validatePhoto(file: File): PhotoValidationResult {
    // Check file type
    if (!this.allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Invalid file type. Please use JPEG, PNG, WebP, or GIF.',
        suggestedFix: 'Convert your image to JPEG or PNG format.'
      };
    }

    // Check file size
    if (file.size > this.maxFileSize) {
      const sizeMB = Math.round(file.size / (1024 * 1024) * 10) / 10;
      const maxSizeMB = Math.round(this.maxFileSize / (1024 * 1024));
      return {
        isValid: false,
        error: `File too large (${sizeMB}MB). Maximum size is ${maxSizeMB}MB.`,
        suggestedFix: 'Compress your image or use a smaller photo.'
      };
    }

    return { isValid: true };
  }

  /**
   * Process and compress uploaded photo
   */
  async processPhoto(file: File): Promise<PhotoUploadResult> {
    try {
      // Validate first
      const validation = this.validatePhoto(file);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error
        };
      }

      // Create canvas for processing
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not create canvas context');
      }

      // Load image
      const img = await this.loadImage(file);
      
      // Calculate new dimensions (maintain aspect ratio)
      const { width, height } = this.calculateDimensions(
        img.width, 
        img.height, 
        this.maxDimensions.width, 
        this.maxDimensions.height
      );

      // Set canvas size
      canvas.width = width;
      canvas.height = height;

      // Draw and compress image
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to data URL
      const dataUrl = canvas.toDataURL('image/jpeg', this.compressionQuality);
      
      // Generate unique filename
      const fileName = this.generateFileName(file.name);
      
      return {
        success: true,
        fileName,
        dataUrl,
        size: Math.round(dataUrl.length * 0.75) // Approximate size
      };

    } catch (error) {
      console.error('Photo processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process photo'
      };
    }
  }

  /**
   * Load image from file
   */
  private loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };
      
      img.src = url;
    });
  }

  /**
   * Calculate new dimensions maintaining aspect ratio
   */
  private calculateDimensions(
    originalWidth: number, 
    originalHeight: number, 
    maxWidth: number, 
    maxHeight: number
  ): { width: number; height: number } {
    const aspectRatio = originalWidth / originalHeight;
    
    let newWidth = originalWidth;
    let newHeight = originalHeight;
    
    // Scale down if necessary
    if (newWidth > maxWidth) {
      newWidth = maxWidth;
      newHeight = newWidth / aspectRatio;
    }
    
    if (newHeight > maxHeight) {
      newHeight = maxHeight;
      newWidth = newHeight * aspectRatio;
    }
    
    return {
      width: Math.round(newWidth),
      height: Math.round(newHeight)
    };
  }

  /**
   * Generate unique filename
   */
  private generateFileName(originalName: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
    return `photo_${timestamp}_${random}.${extension}`;
  }

  /**
   * Create photo thumbnail
   */
  async createThumbnail(dataUrl: string, size: number = 150): Promise<string> {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not create canvas context');

      const img = new Image();
      
      return new Promise((resolve, reject) => {
        img.onload = () => {
          // Make square thumbnail
          canvas.width = size;
          canvas.height = size;
          
          // Calculate crop area (center crop)
          const sourceSize = Math.min(img.width, img.height);
          const sourceX = (img.width - sourceSize) / 2;
          const sourceY = (img.height - sourceSize) / 2;
          
          // Draw cropped and resized image
          ctx.drawImage(
            img,
            sourceX, sourceY, sourceSize, sourceSize,
            0, 0, size, size
          );
          
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        
        img.onerror = () => reject(new Error('Failed to create thumbnail'));
        img.src = dataUrl;
      });
    } catch (error) {
      console.error('Thumbnail creation error:', error);
      throw error;
    }
  }

  /**
   * Delete photo (remove from storage)
   */
  deletePhoto(fileName: string): boolean {
    try {
      // In a real Electron app, this would delete the file from the file system
      // For now, we'll just return success
      console.log(`Photo deleted: ${fileName}`);
      return true;
    } catch (error) {
      console.error('Photo deletion error:', error);
      return false;
    }
  }

  /**
   * Get photo URL for display
   */
  getPhotoUrl(dataUrl: string): string {
    // In the current implementation, we store the data URL directly
    // In a real Electron app, this might construct a file:// URL
    return dataUrl;
  }

  /**
   * Bulk photo processing for multiple uploads
   */
  async processMultiplePhotos(files: File[]): Promise<PhotoUploadResult[]> {
    const results: PhotoUploadResult[] = [];
    
    for (const file of files) {
      const result = await this.processPhoto(file);
      results.push(result);
    }
    
    return results;
  }

  /**
   * Get storage info
   */
  getStorageInfo(): {
    totalPhotos: number;
    estimatedSize: string;
    maxFileSize: string;
    allowedTypes: string[];
  } {
    // In a real app, this would scan the photos directory
    return {
      totalPhotos: 0, // Would be calculated from actual files
      estimatedSize: '0 MB',
      maxFileSize: `${Math.round(this.maxFileSize / (1024 * 1024))}MB`,
      allowedTypes: this.allowedTypes
    };
  }

  /**
   * Optimize photo for different use cases
   */
  async optimizeForUsage(
    dataUrl: string, 
    usage: 'profile' | 'thumbnail' | 'display' | 'print'
  ): Promise<string> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not create canvas context');

    const img = new Image();
    
    return new Promise((resolve, reject) => {
      img.onload = () => {
        let targetWidth: number, targetHeight: number, quality: number;
        
        switch (usage) {
          case 'profile':
            targetWidth = targetHeight = 200;
            quality = 0.9;
            break;
          case 'thumbnail':
            targetWidth = targetHeight = 100;
            quality = 0.8;
            break;
          case 'display':
            targetWidth = 400;
            targetHeight = 400;
            quality = 0.85;
            break;
          case 'print':
            targetWidth = 800;
            targetHeight = 800;
            quality = 0.95;
            break;
        }
        
        const { width, height } = this.calculateDimensions(
          img.width, img.height, targetWidth, targetHeight
        );
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      
      img.onerror = () => reject(new Error('Failed to optimize image'));
      img.src = dataUrl;
    });
  }

  /**
   * Check if image needs compression
   */
  needsCompression(file: File): boolean {
    return file.size > (1024 * 1024); // > 1MB
  }

  /**
   * Get compression recommendations
   */
  getCompressionRecommendation(file: File): {
    recommended: boolean;
    currentSize: string;
    estimatedNewSize: string;
    savings: string;
  } {
    const currentSizeMB = file.size / (1024 * 1024);
    const estimatedNewSizeMB = currentSizeMB * this.compressionQuality;
    const savingsMB = currentSizeMB - estimatedNewSizeMB;
    
    return {
      recommended: this.needsCompression(file),
      currentSize: `${currentSizeMB.toFixed(1)}MB`,
      estimatedNewSize: `${estimatedNewSizeMB.toFixed(1)}MB`,
      savings: `${savingsMB.toFixed(1)}MB`
    };
  }
}

// Photo Upload Hook for React Components
export const usePhotoUpload = () => {
  const photoManager = new PhotoManager();
  
  const uploadPhoto = async (file: File): Promise<PhotoUploadResult> => {
    return await photoManager.processPhoto(file);
  };
  
  const createThumbnail = async (dataUrl: string, size?: number): Promise<string> => {
    return await photoManager.createThumbnail(dataUrl, size);
  };
  
  const validatePhoto = (file: File): PhotoValidationResult => {
    return photoManager.validatePhoto(file);
  };
  
  const deletePhoto = (fileName: string): boolean => {
    return photoManager.deletePhoto(fileName);
  };
  
  const getStorageInfo = () => {
    return photoManager.getStorageInfo();
  };
  
  return {
    uploadPhoto,
    createThumbnail,
    validatePhoto,
    deletePhoto,
    getStorageInfo,
    photoManager
  };
};

// Photo Component Props
export interface PhotoUploaderProps {
  currentPhoto?: string;
  onPhotoChange: (dataUrl: string | undefined, fileName?: string) => void;
  onError?: (error: string) => void;
  size?: 'small' | 'medium' | 'large';
  shape?: 'circle' | 'square' | 'rounded';
  placeholder?: string;
  disabled?: boolean;
  showFileName?: boolean;
  allowRemove?: boolean;
  compressionEnabled?: boolean;
}

// Utility functions for photo handling
export const PhotoUtils = {
  /**
   * Convert file to data URL
   */
  fileToDataUrl: (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  },

  /**
   * Download data URL as file
   */
  downloadDataUrl: (dataUrl: string, filename: string): void => {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  /**
   * Get image dimensions from data URL
   */
  getImageDimensions: (dataUrl: string): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = dataUrl;
    });
  },

  /**
   * Check if data URL is valid image
   */
  isValidImageDataUrl: (dataUrl: string): boolean => {
    return dataUrl.startsWith('data:image/') && dataUrl.includes('base64,');
  },

  /**
   * Get file size from data URL (approximate)
   */
  getDataUrlSize: (dataUrl: string): number => {
    const base64Data = dataUrl.split(',')[1];
    return Math.round(base64Data.length * 0.75); // Approximate conversion from base64
  },

  /**
   * Extract file extension from data URL
   */
  getExtensionFromDataUrl: (dataUrl: string): string => {
    const match = dataUrl.match(/data:image\/([^;]+)/);
    return match ? match[1] : 'jpg';
  }
};

// Create and export singleton instance
export const photoManager = new PhotoManager();