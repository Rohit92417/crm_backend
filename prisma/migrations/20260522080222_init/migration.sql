-- CreateEnum
CREATE TYPE "PickupWorkflowStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'ASSIGNED', 'IN_PROGRESS', 'PICKED_UP', 'STORED', 'COMPLETED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PickupLogAction" AS ENUM ('CREATED', 'UPDATED', 'STATUS_CHANGED', 'ASSIGNED', 'UNASSIGNED', 'APPROVED', 'REJECTED', 'CANCELLED', 'DELETED');

-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('CRM_ADMIN', 'CRM_USER', 'CLIENT_ADMIN', 'CLIENT_USER');

-- CreateEnum
CREATE TYPE "RoleType" AS ENUM ('CRM_ROLE', 'CLIENT_ROLE');

-- CreateEnum
CREATE TYPE "GenderCategory" AS ENUM ('Male', 'Female', 'Other');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'ASSIGNED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "NotificationCategory" AS ENUM ('PICKUP_REQUEST', 'PICKUP_ASSIGNED', 'PICKUP_COMPLETED', 'APPROVAL_PENDING', 'SYSTEM', 'CLIENT');

-- CreateEnum
CREATE TYPE "NotificationPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "gender" "GenderCategory",
    "photo" TEXT,
    "password" TEXT NOT NULL,
    "userType" "UserType" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "uuid" TEXT NOT NULL,
    "activeFrom" TIMESTAMP(3),
    "activeTo" TIMESTAMP(3),
    "lastLogin" TIMESTAMP(3),
    "refCompanyId" INTEGER,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "roleName" TEXT NOT NULL,
    "roleType" "RoleType" NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Module" (
    "id" SERIAL NOT NULL,
    "moduleKey" TEXT NOT NULL,
    "moduleName" TEXT NOT NULL,
    "description" TEXT,
    "parentKey" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Module_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModulePermission" (
    "id" SERIAL NOT NULL,
    "refRoleId" INTEGER NOT NULL,
    "refModuleId" INTEGER NOT NULL,
    "canView" BOOLEAN NOT NULL DEFAULT false,
    "canCreate" BOOLEAN NOT NULL DEFAULT false,
    "canUpdate" BOOLEAN NOT NULL DEFAULT false,
    "canDelete" BOOLEAN NOT NULL DEFAULT false,
    "canApprove" BOOLEAN NOT NULL DEFAULT false,
    "canAssign" BOOLEAN NOT NULL DEFAULT false,
    "canExport" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModulePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "id" SERIAL NOT NULL,
    "refUserId" INTEGER NOT NULL,
    "refRoleId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Country" (
    "id" SERIAL NOT NULL,
    "countryName" TEXT NOT NULL,
    "countryCode" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "State" (
    "id" SERIAL NOT NULL,
    "stateName" TEXT NOT NULL,
    "stateCode" TEXT,
    "refCountryId" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "State_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "City" (
    "id" SERIAL NOT NULL,
    "cityName" TEXT NOT NULL,
    "refStateId" INTEGER NOT NULL,
    "pinCode" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Industry" (
    "id" SERIAL NOT NULL,
    "industryName" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Industry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "logo" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "website" TEXT,
    "address" TEXT NOT NULL,
    "pinCode" TEXT NOT NULL,
    "cityName" TEXT NOT NULL,
    "refStateId" INTEGER NOT NULL,
    "refCountryId" INTEGER NOT NULL,
    "refIndustryId" INTEGER NOT NULL,
    "gstNumber" TEXT,
    "gstDocument" TEXT,
    "panNumber" TEXT,
    "panDocument" TEXT,
    "refOwnerUserId" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cityId" INTEGER,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BranchInfo" (
    "id" SERIAL NOT NULL,
    "refCompanyId" INTEGER NOT NULL,
    "branchName" TEXT NOT NULL,
    "branchType" TEXT NOT NULL,
    "createdBy" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BranchInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RDInfo" (
    "id" SERIAL NOT NULL,
    "rdCode" TEXT NOT NULL,
    "rdName" TEXT NOT NULL,
    "contactPersonName" TEXT NOT NULL,
    "contactPersonPhone" TEXT NOT NULL,
    "contactPersonEmail" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "landmark" TEXT,
    "pincode" TEXT NOT NULL,
    "cityName" TEXT NOT NULL,
    "refStateId" INTEGER NOT NULL,
    "refCountryId" INTEGER NOT NULL,
    "refCompanyId" INTEGER NOT NULL,
    "refBranchInfoId" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cityId" INTEGER,

    CONSTRAINT "RDInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pickup" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "pickupNumber" TEXT NOT NULL,
    "refCompanyId" INTEGER NOT NULL,
    "refRDId" INTEGER NOT NULL,
    "refBranchInfoId" INTEGER,
    "workflowStatus" "PickupWorkflowStatus" NOT NULL,
    "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "scheduledPickupAt" TIMESTAMP(3),
    "auditImages" TEXT,
    "actualPickupAt" TIMESTAMP(3),
    "pickupImages" JSONB,
    "remark" TEXT,
    "refCreatedByUserId" INTEGER NOT NULL,
    "refUpdatedByUserId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pickup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PickupItem" (
    "id" SERIAL NOT NULL,
    "refPickupId" INTEGER NOT NULL,
    "materialType" TEXT,
    "auditWeight" DOUBLE PRECISION,
    "auditBags" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PickupItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PickupApproval" (
    "id" SERIAL NOT NULL,
    "refPickupId" INTEGER NOT NULL,
    "approvalStatus" "ApprovalStatus" NOT NULL,
    "approvedByUserId" INTEGER NOT NULL,
    "approvalRemarks" TEXT,
    "approvedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PickupApproval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PickupLog" (
    "id" SERIAL NOT NULL,
    "refPickupId" INTEGER NOT NULL,
    "action" "PickupLogAction" NOT NULL,
    "refUserId" INTEGER NOT NULL,
    "userName" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "userType" "UserType" NOT NULL,
    "beforeData" JSONB,
    "afterData" JSONB,
    "changedFields" TEXT[],
    "remarks" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PickupLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PickupStatus" (
    "id" SERIAL NOT NULL,
    "statusKey" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "colorCode" TEXT,
    "sortOrder" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PickupStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "category" "NotificationCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "refSenderUserId" INTEGER,
    "referenceType" TEXT,
    "referenceId" INTEGER,
    "actionUrl" TEXT,
    "priority" "NotificationPriority" NOT NULL DEFAULT 'NORMAL',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationRecipient" (
    "id" SERIAL NOT NULL,
    "refNotificationId" INTEGER NOT NULL,
    "refUserId" INTEGER NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationRecipient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" SERIAL NOT NULL,
    "refUserId" INTEGER NOT NULL,
    "userType" "UserType" NOT NULL,
    "userName" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" INTEGER,
    "oldValues" TEXT,
    "newValues" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_uuid_key" ON "User"("uuid");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_phone_idx" ON "User"("phone");

-- CreateIndex
CREATE INDEX "User_userType_idx" ON "User"("userType");

-- CreateIndex
CREATE INDEX "User_refCompanyId_idx" ON "User"("refCompanyId");

-- CreateIndex
CREATE INDEX "User_isActive_isDeleted_idx" ON "User"("isActive", "isDeleted");

-- CreateIndex
CREATE UNIQUE INDEX "Role_roleName_key" ON "Role"("roleName");

-- CreateIndex
CREATE INDEX "Role_roleType_idx" ON "Role"("roleType");

-- CreateIndex
CREATE INDEX "Role_isActive_idx" ON "Role"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Module_moduleKey_key" ON "Module"("moduleKey");

-- CreateIndex
CREATE INDEX "Module_moduleKey_idx" ON "Module"("moduleKey");

-- CreateIndex
CREATE INDEX "Module_parentKey_idx" ON "Module"("parentKey");

-- CreateIndex
CREATE INDEX "ModulePermission_refRoleId_idx" ON "ModulePermission"("refRoleId");

-- CreateIndex
CREATE INDEX "ModulePermission_refModuleId_idx" ON "ModulePermission"("refModuleId");

-- CreateIndex
CREATE UNIQUE INDEX "ModulePermission_refRoleId_refModuleId_key" ON "ModulePermission"("refRoleId", "refModuleId");

-- CreateIndex
CREATE INDEX "UserRole_refUserId_idx" ON "UserRole"("refUserId");

-- CreateIndex
CREATE INDEX "UserRole_refRoleId_idx" ON "UserRole"("refRoleId");

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_refUserId_refRoleId_key" ON "UserRole"("refUserId", "refRoleId");

-- CreateIndex
CREATE UNIQUE INDEX "Country_countryName_key" ON "Country"("countryName");

-- CreateIndex
CREATE UNIQUE INDEX "Country_countryCode_key" ON "Country"("countryCode");

-- CreateIndex
CREATE INDEX "Country_countryName_idx" ON "Country"("countryName");

-- CreateIndex
CREATE INDEX "Country_isActive_idx" ON "Country"("isActive");

-- CreateIndex
CREATE INDEX "State_stateName_idx" ON "State"("stateName");

-- CreateIndex
CREATE INDEX "State_refCountryId_idx" ON "State"("refCountryId");

-- CreateIndex
CREATE INDEX "State_isActive_idx" ON "State"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "State_stateName_refCountryId_key" ON "State"("stateName", "refCountryId");

-- CreateIndex
CREATE INDEX "City_cityName_idx" ON "City"("cityName");

-- CreateIndex
CREATE INDEX "City_refStateId_idx" ON "City"("refStateId");

-- CreateIndex
CREATE INDEX "City_pinCode_idx" ON "City"("pinCode");

-- CreateIndex
CREATE INDEX "City_isActive_idx" ON "City"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "City_cityName_refStateId_key" ON "City"("cityName", "refStateId");

-- CreateIndex
CREATE UNIQUE INDEX "Industry_industryName_key" ON "Industry"("industryName");

-- CreateIndex
CREATE INDEX "Industry_isActive_idx" ON "Industry"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Company_uuid_key" ON "Company"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Company_email_key" ON "Company"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Company_gstNumber_key" ON "Company"("gstNumber");

-- CreateIndex
CREATE INDEX "Company_email_idx" ON "Company"("email");

-- CreateIndex
CREATE INDEX "Company_gstNumber_idx" ON "Company"("gstNumber");

-- CreateIndex
CREATE INDEX "Company_refOwnerUserId_idx" ON "Company"("refOwnerUserId");

-- CreateIndex
CREATE INDEX "Company_isActive_isDeleted_idx" ON "Company"("isActive", "isDeleted");

-- CreateIndex
CREATE INDEX "BranchInfo_refCompanyId_idx" ON "BranchInfo"("refCompanyId");

-- CreateIndex
CREATE UNIQUE INDEX "RDInfo_rdCode_key" ON "RDInfo"("rdCode");

-- CreateIndex
CREATE INDEX "RDInfo_rdCode_idx" ON "RDInfo"("rdCode");

-- CreateIndex
CREATE INDEX "RDInfo_refCompanyId_idx" ON "RDInfo"("refCompanyId");

-- CreateIndex
CREATE INDEX "RDInfo_isActive_isDeleted_idx" ON "RDInfo"("isActive", "isDeleted");

-- CreateIndex
CREATE UNIQUE INDEX "Pickup_uuid_key" ON "Pickup"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Pickup_pickupNumber_key" ON "Pickup"("pickupNumber");

-- CreateIndex
CREATE INDEX "Pickup_pickupNumber_idx" ON "Pickup"("pickupNumber");

-- CreateIndex
CREATE INDEX "Pickup_workflowStatus_idx" ON "Pickup"("workflowStatus");

-- CreateIndex
CREATE INDEX "Pickup_approvalStatus_idx" ON "Pickup"("approvalStatus");

-- CreateIndex
CREATE INDEX "Pickup_refCompanyId_idx" ON "Pickup"("refCompanyId");

-- CreateIndex
CREATE INDEX "Pickup_refRDId_idx" ON "Pickup"("refRDId");

-- CreateIndex
CREATE INDEX "Pickup_refBranchInfoId_idx" ON "Pickup"("refBranchInfoId");

-- CreateIndex
CREATE INDEX "Pickup_refCreatedByUserId_idx" ON "Pickup"("refCreatedByUserId");

-- CreateIndex
CREATE INDEX "Pickup_scheduledPickupAt_idx" ON "Pickup"("scheduledPickupAt");

-- CreateIndex
CREATE INDEX "Pickup_actualPickupAt_idx" ON "Pickup"("actualPickupAt");

-- CreateIndex
CREATE INDEX "Pickup_createdAt_idx" ON "Pickup"("createdAt");

-- CreateIndex
CREATE INDEX "PickupItem_refPickupId_idx" ON "PickupItem"("refPickupId");

-- CreateIndex
CREATE INDEX "PickupItem_materialType_idx" ON "PickupItem"("materialType");

-- CreateIndex
CREATE INDEX "PickupApproval_refPickupId_idx" ON "PickupApproval"("refPickupId");

-- CreateIndex
CREATE INDEX "PickupApproval_approvalStatus_idx" ON "PickupApproval"("approvalStatus");

-- CreateIndex
CREATE INDEX "PickupApproval_approvedByUserId_idx" ON "PickupApproval"("approvedByUserId");

-- CreateIndex
CREATE INDEX "PickupApproval_approvedAt_idx" ON "PickupApproval"("approvedAt");

-- CreateIndex
CREATE INDEX "PickupLog_refPickupId_idx" ON "PickupLog"("refPickupId");

-- CreateIndex
CREATE INDEX "PickupLog_action_idx" ON "PickupLog"("action");

-- CreateIndex
CREATE INDEX "PickupLog_refUserId_idx" ON "PickupLog"("refUserId");

-- CreateIndex
CREATE INDEX "PickupLog_createdAt_idx" ON "PickupLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PickupStatus_statusKey_key" ON "PickupStatus"("statusKey");

-- CreateIndex
CREATE INDEX "PickupStatus_sortOrder_idx" ON "PickupStatus"("sortOrder");

-- CreateIndex
CREATE INDEX "PickupStatus_isActive_idx" ON "PickupStatus"("isActive");

-- CreateIndex
CREATE INDEX "Notification_category_idx" ON "Notification"("category");

-- CreateIndex
CREATE INDEX "Notification_priority_idx" ON "Notification"("priority");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE INDEX "NotificationRecipient_refUserId_idx" ON "NotificationRecipient"("refUserId");

-- CreateIndex
CREATE INDEX "NotificationRecipient_isRead_idx" ON "NotificationRecipient"("isRead");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationRecipient_refNotificationId_refUserId_key" ON "NotificationRecipient"("refNotificationId", "refUserId");

-- CreateIndex
CREATE INDEX "AuditLog_refUserId_idx" ON "AuditLog"("refUserId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_idx" ON "AuditLog"("entityType");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_refCompanyId_fkey" FOREIGN KEY ("refCompanyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModulePermission" ADD CONSTRAINT "ModulePermission_refRoleId_fkey" FOREIGN KEY ("refRoleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModulePermission" ADD CONSTRAINT "ModulePermission_refModuleId_fkey" FOREIGN KEY ("refModuleId") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_refUserId_fkey" FOREIGN KEY ("refUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_refRoleId_fkey" FOREIGN KEY ("refRoleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "State" ADD CONSTRAINT "State_refCountryId_fkey" FOREIGN KEY ("refCountryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "City" ADD CONSTRAINT "City_refStateId_fkey" FOREIGN KEY ("refStateId") REFERENCES "State"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_refOwnerUserId_fkey" FOREIGN KEY ("refOwnerUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_refStateId_fkey" FOREIGN KEY ("refStateId") REFERENCES "State"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_refCountryId_fkey" FOREIGN KEY ("refCountryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_refIndustryId_fkey" FOREIGN KEY ("refIndustryId") REFERENCES "Industry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BranchInfo" ADD CONSTRAINT "BranchInfo_refCompanyId_fkey" FOREIGN KEY ("refCompanyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BranchInfo" ADD CONSTRAINT "BranchInfo_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RDInfo" ADD CONSTRAINT "RDInfo_refStateId_fkey" FOREIGN KEY ("refStateId") REFERENCES "State"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RDInfo" ADD CONSTRAINT "RDInfo_refCountryId_fkey" FOREIGN KEY ("refCountryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RDInfo" ADD CONSTRAINT "RDInfo_refCompanyId_fkey" FOREIGN KEY ("refCompanyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RDInfo" ADD CONSTRAINT "RDInfo_refBranchInfoId_fkey" FOREIGN KEY ("refBranchInfoId") REFERENCES "BranchInfo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RDInfo" ADD CONSTRAINT "RDInfo_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pickup" ADD CONSTRAINT "Pickup_refCompanyId_fkey" FOREIGN KEY ("refCompanyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pickup" ADD CONSTRAINT "Pickup_refRDId_fkey" FOREIGN KEY ("refRDId") REFERENCES "RDInfo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pickup" ADD CONSTRAINT "Pickup_refBranchInfoId_fkey" FOREIGN KEY ("refBranchInfoId") REFERENCES "BranchInfo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pickup" ADD CONSTRAINT "Pickup_refCreatedByUserId_fkey" FOREIGN KEY ("refCreatedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pickup" ADD CONSTRAINT "Pickup_refUpdatedByUserId_fkey" FOREIGN KEY ("refUpdatedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PickupItem" ADD CONSTRAINT "PickupItem_refPickupId_fkey" FOREIGN KEY ("refPickupId") REFERENCES "Pickup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PickupApproval" ADD CONSTRAINT "PickupApproval_refPickupId_fkey" FOREIGN KEY ("refPickupId") REFERENCES "Pickup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PickupApproval" ADD CONSTRAINT "PickupApproval_approvedByUserId_fkey" FOREIGN KEY ("approvedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PickupLog" ADD CONSTRAINT "PickupLog_refPickupId_fkey" FOREIGN KEY ("refPickupId") REFERENCES "Pickup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_refSenderUserId_fkey" FOREIGN KEY ("refSenderUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationRecipient" ADD CONSTRAINT "NotificationRecipient_refNotificationId_fkey" FOREIGN KEY ("refNotificationId") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationRecipient" ADD CONSTRAINT "NotificationRecipient_refUserId_fkey" FOREIGN KEY ("refUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
