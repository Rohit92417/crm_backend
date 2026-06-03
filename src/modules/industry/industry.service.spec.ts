import { Test, TestingModule } from '@nestjs/testing';
import { IndustryService } from './industry.service';
import { PrismaService } from '../../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('IndustryService', () => {
  let service: IndustryService;
  let prisma: PrismaService;

  const mockPrismaService = {
    industry: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IndustryService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<IndustryService>(IndustryService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw BadRequestException if industry already exists', async () => {
      const dto = { industryName: 'Logistics' };
      mockPrismaService.industry.findUnique.mockResolvedValue(dto);

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('should create industry if it does not exist', async () => {
      const dto = { industryName: 'New Industry' };
      mockPrismaService.industry.findUnique.mockResolvedValue(null);
      mockPrismaService.industry.create.mockResolvedValue(dto);

      const result = await service.create(dto);
      expect(result).toEqual(dto);
      expect(mockPrismaService.industry.create).toHaveBeenCalledWith({
        data: dto,
      });
    });
  });

  describe('findAll', () => {
    it('should return all industries', async () => {
      const industries = [
        { industryName: 'Industry 1' },
        { industryName: 'Industry 2' },
      ];
      mockPrismaService.industry.findMany.mockResolvedValue(industries);

      const result = await service.findAll();
      expect(result).toEqual(industries);
      expect(mockPrismaService.industry.findMany).toHaveBeenCalled();
    });
  });
});
