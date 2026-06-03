import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { CurrentUserData } from '../decorators/current-user.decorator';

@Injectable()
export class CompanyAccessGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user: CurrentUserData = request.user;
    const companyId = this.extractCompanyId(request);

    // CRM users can access all companies
    if (user.userType === 'CRM_ADMIN' || user.userType === 'CRM_USER') {
      return true;
    }

    // Client users can only access their own company
    if (!user.refCompanyId) {
      throw new ForbiddenException('User not associated with any company');
    }

    if (companyId && user.refCompanyId !== companyId) {
      throw new ForbiddenException('Access denied to this company data');
    }

    return true;
  }

  private extractCompanyId(request: any): number | null {
    // Check params
    if (request.params?.companyId) {
      return parseInt(request.params.companyId, 10);
    }
    
    // Check query
    if (request.query?.companyId) {
      return parseInt(request.query.companyId, 10);
    }
    
    // Check body
    if (request.body?.refCompanyId) {
      return parseInt(request.body.refCompanyId, 10);
    }
    
    return null;
  }
}
