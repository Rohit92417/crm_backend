import { Body, Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CityService } from './city.service';
import { Public } from '../../../common/decorators/public.decorator';

@ApiTags('City')
@Controller('cities')
export class CityController {
  constructor(private service: CityService) {}

  @Public()
  @Get('by-state/:stateId')
  findByState(@Param('stateId') stateId: number) {
    return this.service.findByState(+stateId);
  }
}
