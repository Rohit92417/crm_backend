import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const isLocal =
  process.env.DATABASE_URL?.includes('localhost') ||
  process.env.DATABASE_URL?.includes('127.0.0.1');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isLocal ? false : { rejectUnauthorized: false },
});

if (!isLocal) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ─── helpers ───────────────────────────────────────────────────────────────

type PermMap = Partial<{
  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canApprove: boolean;
  canAssign: boolean;
  canExport: boolean;
}>;

const ALL: PermMap = {
  canView: true, canCreate: true, canUpdate: true, canDelete: true,
  canApprove: true, canAssign: true, canExport: true,
};

const NONE: PermMap = {};

function p(overrides: PermMap): Required<PermMap> {
  return {
    canView: false, canCreate: false, canUpdate: false, canDelete: false,
    canApprove: false, canAssign: false, canExport: false,
    ...overrides,
  };
}

async function upsertPermission(roleId: number, moduleId: number, perms: PermMap) {
  const full = p(perms);
  await prisma.modulePermission.upsert({
    where: { refRoleId_refModuleId: { refRoleId: roleId, refModuleId: moduleId } },
    update: full,
    create: { refRoleId: roleId, refModuleId: moduleId, ...full },
  });
}

// ─── main ──────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Countries
  console.log('📍 Seeding countries...');
  const india = await prisma.country.upsert({
    where: { countryName: 'India' },
    update: {},
    create: { countryName: 'India', countryCode: 'IN', isActive: true },
  });

  const usa = await prisma.country.upsert({
    where: { countryName: 'United States' },
    update: {},
    create: { countryName: 'United States', countryCode: 'US', isActive: true },
  });

  // 2. States
  console.log('📍 Seeding states...');
  const maharashtra = await prisma.state.upsert({
    where: { stateName_refCountryId: { stateName: 'Maharashtra', refCountryId: india.id } },
    update: {},
    create: { stateName: 'Maharashtra', stateCode: 'MH', refCountryId: india.id, isActive: true },
  });

  const karnataka = await prisma.state.upsert({
    where: { stateName_refCountryId: { stateName: 'Karnataka', refCountryId: india.id } },
    update: {},
    create: { stateName: 'Karnataka', stateCode: 'KA', refCountryId: india.id, isActive: true },
  });

  const delhi = await prisma.state.upsert({
    where: { stateName_refCountryId: { stateName: 'Delhi', refCountryId: india.id } },
    update: {},
    create: { stateName: 'Delhi', stateCode: 'DL', refCountryId: india.id, isActive: true },
  });

  const gujarat = await prisma.state.upsert({
    where: { stateName_refCountryId: { stateName: 'Gujarat', refCountryId: india.id } },
    update: {},
    create: { stateName: 'Gujarat', stateCode: 'GJ', refCountryId: india.id, isActive: true },
  });

  const california = await prisma.state.upsert({
    where: { stateName_refCountryId: { stateName: 'California', refCountryId: usa.id } },
    update: {},
    create: { stateName: 'California', stateCode: 'CA', refCountryId: usa.id, isActive: true },
  });

  // 3. Cities
  console.log('📍 Seeding cities...');
  const cityData = [
    { cityName: 'Mumbai', refStateId: maharashtra.id, pinCode: '400001' },
    { cityName: 'Pune', refStateId: maharashtra.id, pinCode: '411001' },
    { cityName: 'Nashik', refStateId: maharashtra.id, pinCode: '422001' },
    { cityName: 'Bengaluru', refStateId: karnataka.id, pinCode: '560001' },
    { cityName: 'Mysuru', refStateId: karnataka.id, pinCode: '570001' },
    { cityName: 'New Delhi', refStateId: delhi.id, pinCode: '110001' },
    { cityName: 'Ahmedabad', refStateId: gujarat.id, pinCode: '380001' },
    { cityName: 'Surat', refStateId: gujarat.id, pinCode: '395001' },
    { cityName: 'San Francisco', refStateId: california.id, pinCode: '94102' },
    { cityName: 'Los Angeles', refStateId: california.id, pinCode: '90001' },
  ];

  for (const city of cityData) {
    await prisma.city.upsert({
      where: { cityName_refStateId: { cityName: city.cityName, refStateId: city.refStateId } },
      update: {},
      create: { ...city, isActive: true },
    });
  }

  // 4. Industries
  console.log('🏭 Seeding industries...');
  const industries = [
    { industryName: 'Retail', description: 'Retail and consumer goods' },
    { industryName: 'Manufacturing', description: 'Manufacturing and production' },
    { industryName: 'Healthcare', description: 'Hospitals and medical facilities' },
    { industryName: 'Hospitality', description: 'Hotels, restaurants, and food service' },
    { industryName: 'FMCG', description: 'Fast-moving consumer goods' },
    { industryName: 'Education', description: 'Schools, colleges, and universities' },
    { industryName: 'IT & Technology', description: 'Software and technology companies' },
    { industryName: 'Logistics', description: 'Transport and supply chain' },
    { industryName: 'Construction', description: 'Building and infrastructure' },
    { industryName: 'E-Commerce', description: 'Online retail and fulfillment' },
  ];

  for (const industry of industries) {
    await prisma.industry.upsert({
      where: { industryName: industry.industryName },
      update: {},
      create: { ...industry, isActive: true },
    });
  }

  // 5. Pickup Statuses — keys aligned with PickupWorkflowStatus enum
  console.log('📦 Seeding pickup statuses...');
  const pickupStatuses = [
    { statusKey: 'DRAFT', displayName: 'Draft', colorCode: '#9E9E9E', sortOrder: 1 },
    { statusKey: 'PENDING_APPROVAL', displayName: 'Pending Approval', colorCode: '#FF9800', sortOrder: 2 },
    { statusKey: 'APPROVED', displayName: 'Approved', colorCode: '#2196F3', sortOrder: 3 },
    { statusKey: 'ASSIGNED', displayName: 'Assigned', colorCode: '#9C27B0', sortOrder: 4 },
    { statusKey: 'IN_PROGRESS', displayName: 'In Progress', colorCode: '#FF5722', sortOrder: 5 },
    { statusKey: 'PICKED_UP', displayName: 'Picked Up', colorCode: '#00BCD4', sortOrder: 6 },
    { statusKey: 'STORED', displayName: 'Stored', colorCode: '#3F51B5', sortOrder: 7 },
    { statusKey: 'COMPLETED', displayName: 'Completed', colorCode: '#4CAF50', sortOrder: 8 },
    { statusKey: 'REJECTED', displayName: 'Rejected', colorCode: '#F44336', sortOrder: 9 },
    { statusKey: 'CANCELLED', displayName: 'Cancelled', colorCode: '#607D8B', sortOrder: 10 },
  ];

  for (const status of pickupStatuses) {
    await prisma.pickupStatus.upsert({
      where: { statusKey: status.statusKey },
      update: { displayName: status.displayName, colorCode: status.colorCode, sortOrder: status.sortOrder },
      create: { ...status, isActive: true },
    });
  }

  // 6. Modules
  console.log('🔧 Seeding modules...');
  const moduleData = [
    { moduleKey: 'dashboard', moduleName: 'Dashboard', description: 'Analytics and overview', sortOrder: 1 },
    { moduleKey: 'users', moduleName: 'User Management', description: 'Create and manage CRM/client users', sortOrder: 2 },
    { moduleKey: 'clients', moduleName: 'Client Registry', description: 'Client company onboarding & data', sortOrder: 3 },
    { moduleKey: 'branches', moduleName: 'Branch Management', description: 'Client branch management', sortOrder: 4 },
    { moduleKey: 'rds', moduleName: 'Depot (RD) Info', description: 'Retail destination management', sortOrder: 5 },
    { moduleKey: 'pickups', moduleName: 'Logistics Ops', description: 'Pickup scheduling and tracking', sortOrder: 6 },
    { moduleKey: 'approvals', moduleName: 'Approvals', description: 'Pickup approval workflow', sortOrder: 7 },
    { moduleKey: 'reports', moduleName: 'Reports', description: 'Analytics and export', sortOrder: 8 },
    { moduleKey: 'notifications', moduleName: 'Notifications', description: 'System and user notifications', sortOrder: 9 },
    { moduleKey: 'audit', moduleName: 'Audit Logs', description: 'System audit trail', sortOrder: 10 },
    { moduleKey: 'settings', moduleName: 'Settings', description: 'System configuration', sortOrder: 11 },
  ];

  const seededModules: Record<string, number> = {};
  for (const mod of moduleData) {
    const m = await prisma.module.upsert({
      where: { moduleKey: mod.moduleKey },
      update: { moduleName: mod.moduleName, description: mod.description, sortOrder: mod.sortOrder },
      create: { ...mod, isActive: true },
    });
    seededModules[mod.moduleKey] = m.id;
  }

  // 7. Roles
  console.log('👥 Seeding roles...');
  const superAdminRole = await prisma.role.upsert({
    where: { roleName: 'Super Admin' },
    update: {},
    create: { roleName: 'Super Admin', roleType: 'CRM_ROLE', description: 'Full system access — all modules', isActive: true },
  });

  const crmManagerRole = await prisma.role.upsert({
    where: { roleName: 'CRM Manager' },
    update: {},
    create: { roleName: 'CRM Manager', roleType: 'CRM_ROLE', description: 'Manages clients, pickups, and field agents', isActive: true },
  });

  const fieldAgentRole = await prisma.role.upsert({
    where: { roleName: 'Field Agent' },
    update: {},
    create: { roleName: 'Field Agent', roleType: 'CRM_ROLE', description: 'Executes pickup operations on the ground', isActive: true },
  });

  const clientAdminRole = await prisma.role.upsert({
    where: { roleName: 'Client Administrator' },
    update: {},
    create: { roleName: 'Client Administrator', roleType: 'CLIENT_ROLE', description: 'Manages own company pickups, branches, and RDs', isActive: true },
  });

  const clientUserRole = await prisma.role.upsert({
    where: { roleName: 'Client User' },
    update: {},
    create: { roleName: 'Client User', roleType: 'CLIENT_ROLE', description: 'View-only access to own company data', isActive: true },
  });

  // 8. Module Permissions
  console.log('🔐 Seeding module permissions...');

  // Super Admin — unrestricted
  for (const moduleId of Object.values(seededModules)) {
    await upsertPermission(superAdminRole.id, moduleId, ALL);
  }

  // CRM Manager — no audit/settings delete; can approve & assign pickups
  const crmManagerPerms: Record<string, PermMap> = {
    dashboard: { canView: true, canExport: true },
    users: { canView: true, canCreate: true, canUpdate: true },
    clients: { canView: true, canCreate: true, canUpdate: true, canExport: true },
    branches: { canView: true, canCreate: true, canUpdate: true },
    rds: { canView: true, canCreate: true, canUpdate: true, canExport: true },
    pickups: { canView: true, canCreate: true, canUpdate: true, canApprove: true, canAssign: true, canExport: true },
    approvals: { canView: true, canApprove: true },
    reports: { canView: true, canExport: true },
    notifications: { canView: true },
    audit: { canView: true },
    settings: NONE,
  };
  for (const [key, perms] of Object.entries(crmManagerPerms)) {
    await upsertPermission(crmManagerRole.id, seededModules[key], perms);
  }

  // Field Agent — execute pickups, view assigned data
  const fieldAgentPerms: Record<string, PermMap> = {
    dashboard: { canView: true },
    users: NONE,
    clients: NONE,
    branches: NONE,
    rds: { canView: true },
    pickups: { canView: true, canUpdate: true },
    approvals: NONE,
    reports: NONE,
    notifications: { canView: true },
    audit: NONE,
    settings: NONE,
  };
  for (const [key, perms] of Object.entries(fieldAgentPerms)) {
    await upsertPermission(fieldAgentRole.id, seededModules[key], perms);
  }

  // Client Administrator — manage own company scope
  const clientAdminPerms: Record<string, PermMap> = {
    dashboard: { canView: true },
    users: NONE,
    clients: { canView: true, canUpdate: true },
    branches: { canView: true, canCreate: true, canUpdate: true, canDelete: true },
    rds: { canView: true, canCreate: true, canUpdate: true },
    pickups: { canView: true, canCreate: true, canUpdate: true, canExport: true },
    approvals: { canView: true },
    reports: { canView: true, canExport: true },
    notifications: { canView: true },
    audit: NONE,
    settings: NONE,
  };
  for (const [key, perms] of Object.entries(clientAdminPerms)) {
    await upsertPermission(clientAdminRole.id, seededModules[key], perms);
  }

  // Client User — view only
  const clientUserPerms: Record<string, PermMap> = {
    dashboard: { canView: true },
    users: NONE,
    clients: NONE,
    branches: { canView: true },
    rds: { canView: true },
    pickups: { canView: true },
    approvals: NONE,
    reports: NONE,
    notifications: { canView: true },
    audit: NONE,
    settings: NONE,
  };
  for (const [key, perms] of Object.entries(clientUserPerms)) {
    await upsertPermission(clientUserRole.id, seededModules[key], perms);
  }

  // 9. System Users
  console.log('👤 Seeding system users...');

  const usersToCreate = [
    {
      name: 'Super Admin',
      email: 'admin@crm.com',
      phone: '+919000000001',
      password: 'Admin@123',
      userType: 'CRM_ADMIN' as const,
      roleId: superAdminRole.id,
    },
    {
      name: 'CRM Manager',
      email: 'manager@crm.com',
      phone: '+919000000002',
      password: 'Manager@123',
      userType: 'CRM_USER' as const,
      roleId: crmManagerRole.id,
    },
    {
      name: 'Field Agent',
      email: 'agent@crm.com',
      phone: '+919000000003',
      password: 'Agent@123',
      userType: 'CRM_USER' as const,
      roleId: fieldAgentRole.id,
    },
  ];


  for (const u of usersToCreate) {
    const hashed = await bcrypt.hash(u.password, 10);
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { email: u.email },
      create: {
        name: u.name,
        email: u.email,
        phone: u.phone,
        password: hashed,
        userType: u.userType,
        isActive: true,
      },
    });

    await prisma.userRole.upsert({
      where: { refUserId_refRoleId: { refUserId: user.id, refRoleId: u.roleId } },
      update: {},
      create: { refUserId: user.id, refRoleId: u.roleId },
    });
  }

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log('\n✅ Database seeding completed successfully!');
  console.log('\n📝 Default Login Credentials:');
  console.log('┌──────────────────┬───────────────────────┬───────────────┐');
  console.log('│ Role             │ Email                 │ Password      │');
  console.log('├──────────────────┼───────────────────────┼───────────────┤');
  console.log('│ Super Admin      │ admin@crm.com         │ Admin@123     │');
  console.log('│ CRM Manager      │ manager@crm.com       │ Manager@123   │');
  console.log('│ Field Agent      │ agent@crm.com         │ Agent@123     │');
  console.log('└──────────────────┴───────────────────────┴───────────────┘');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
