import { PartialType } from '@nestjs/swagger';
import { CreateRdDto } from './create-rd.dto';

export class UpdateRdDto extends PartialType(CreateRdDto) {}
