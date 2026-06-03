import { Body, Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { StateService } from './state.service';
import { Public } from '../../../common/decorators/public.decorator';

@ApiTags('State')
@Controller('states')
export class StateController {
  constructor(private service: StateService) {}

  @Public()
  @Get('by-country/:countryId')
  findByCountry(@Param('countryId') countryId: number) {
    return this.service.findByCountry(+countryId);
  }
}
