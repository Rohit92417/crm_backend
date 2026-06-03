import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { CountryService } from './country.service';
import { CountryResponseDto } from './dto';
import { Public } from '../../../common/decorators/public.decorator';

@Controller('countries')
export class CountryController {
  constructor(private readonly countryService: CountryService) {}

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllCountries(): Promise<CountryResponseDto[]> {
    return this.countryService.findAll();
  }
}
