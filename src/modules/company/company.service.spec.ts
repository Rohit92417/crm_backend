import { Test, TestingModule } from '@nestjs/testing';
import { CompanyService } from './company.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { BadRequestException } from '@nestjs/common';

describe('CompanyService', () => {
  let service: CompanyService;
  let prisma: PrismaService;

  const mockPrismaService = {
    company: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    role: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    userRole: {
      create: jest.fn(),
    },
    $transaction: jest.fn((cb) => cb(mockPrismaService)),
  };

  const mockNotificationService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: NotificationService, useValue: mockNotificationService },
      ],
    }).compile();

    service = module.get<CompanyService>(CompanyService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw BadRequestException if company email exists', async () => {
      const dto = { email: 'test@company.com' } as any;
      mockPrismaService.company.findUnique.mockResolvedValue({ id: 1 });

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('should create company if it does not exist', async () => {
      const dto = { email: 'new@company.com' } as any;
      mockPrismaService.company.findUnique.mockResolvedValue(null);
      mockPrismaService.company.create.mockResolvedValue({ id: 1, ...dto });

      const result = await service.create(dto);
      expect(result.company?.id ?? (result as any).id).toBe(1);
      expect(mockPrismaService.company.create).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return company with includes', async () => {
      const company = { id: 1, name: 'Test Co' };
      mockPrismaService.company.findUnique.mockResolvedValue(company);

      const result = await service.findOne(1);
      expect(result).toEqual(company);
      expect(mockPrismaService.company.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.anything(),
        }),
      );
    });
  });
});
