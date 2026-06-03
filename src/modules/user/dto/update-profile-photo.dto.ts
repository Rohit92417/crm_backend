import { IsOptional } from 'class-validator';

export class UpdateProfilePhotoDto {
  @IsOptional()
  photo?: any;
}