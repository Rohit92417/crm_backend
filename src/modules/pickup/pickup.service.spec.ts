import { Test, TestingModule } from '@nestjs/testing';
import { PickupService } from './pickup.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { NotFoundException } from '@nestjs/common';

describe('PickupService', () => {
  let service: PickupService;
  let prisma: PrismaService;
  let notificationService: NotificationService;

  const mockPrismaService = {
    pickup: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    pickupStatus: {
      findFirst: jest.fn(),
    },
  };

  const mockNotificationService = {
    create: jest.fn(),
  };

  const mockCrmUser: any = {
    id: 1,
    userType: 'CRM_ADMIN',
    refCompanyId: null,
    name: 'Admin',
    email: 'admin@test.com',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PickupService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: NotificationService, useValue: mockNotificationService },
      ],
    }).compile();

    service = module.get<PickupService>(PickupService);
    prisma = module.get<PrismaService>(PrismaService);
    notificationService = module.get<NotificationService>(NotificationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should throw NotFoundException if pickup not found', async () => {
      mockPrismaService.pickup.findUnique.mockResolvedValue(null);
      await expect(service.findOne(1, mockCrmUser)).rejects.toThrow(NotFoundException);
    });

    it('should return pickup if found', async () => {
      const pickup = { id: 1, refCompanyId: null };
      mockPrismaService.pickup.findUnique.mockResolvedValue(pickup);
      const result = await service.findOne(1, mockCrmUser);
      expect(result).toEqual(pickup);
    });
  });

  describe('update', () => {
    it('should update pickup status by statusKey', async () => {
      const pickup = { id: 1, refCompanyId: null };
      const status = { id: 2, statusKey: 'COMPLETED' };
      const updated = { ...pickup, status };

      mockPrismaService.pickup.findUnique.mockResolvedValue(pickup);
      mockPrismaService.pickupStatus.findFirst.mockResolvedValue(status);
      mockPrismaService.pickup.update.mockResolvedValue(updated);

      const result = await service.update(1, { workflowStatus: 'COMPLETED' }, mockCrmUser);

      expect(mockPrismaService.pickup.update).toHaveBeenCalled();
      expect(result).toHaveProperty('message', 'Pickup updated successfully');
    });
  });
});
