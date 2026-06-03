import { Injectable, BadRequestException } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';

export interface StoredFile {
  /** Relative URL path served by the app, e.g. /uploads/profile-photos/user-1-123.jpg */
  url: string;
}

/**
 * Abstract storage contract.
 *
 * Current implementation: LocalStorageService — writes to ./uploads/ on disk.
 * Not suitable for multi-instance deployments (each pod has its own disk).
 *
 * To swap to S3:
 *   1. npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
 *   2. Create S3StorageService extends StorageService
 *      - upload(): PutObjectCommand → return public URL or pre-signed URL
 *      - delete(): DeleteObjectCommand
 *   3. Replace { useClass: LocalStorageService } in app.module.ts providers
 */
export abstract class StorageService {
  abstract upload(
    file: Express.Multer.File,
    folder: string,
    allowedMimeTypes?: string[],
    maxSizeBytes?: number,
  ): Promise<StoredFile>;

  abstract delete(url: string): Promise<void>;
}

@Injectable()
export class LocalStorageService extends StorageService {
  private readonly uploadRoot = path.join(process.cwd(), 'uploads');

  async upload(
    file: Express.Multer.File,
    folder: string,
    allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
    maxSizeBytes = 2 * 1024 * 1024,
  ): Promise<StoredFile> {
    if (!file) throw new BadRequestException('File is required');

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed: ${allowedMimeTypes.join(', ')}`,
      );
    }

    if (file.size > maxSizeBytes) {
      throw new BadRequestException(
        `File size exceeds ${maxSizeBytes / (1024 * 1024)} MB limit`,
      );
    }

    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    const dir = path.join(this.uploadRoot, folder);
    const filePath = path.join(dir, filename);

    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, file.buffer);

    return { url: `/uploads/${folder}/${filename}` };
  }

  async delete(url: string): Promise<void> {
    if (!url) return;
    const filePath = path.join(process.cwd(), url);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
}
