import {
  Controller, Post, Patch, Body, Get,
  UseGuards, Res, Req, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser, type CurrentUserData } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

const REFRESH_COOKIE = 'refreshToken';
const ACCESS_COOKIE  = 'accessToken';

const isProd = process.env.NODE_ENV === 'production';

const cookieBase = {
  httpOnly: true,
  // Cross-site (frontend and API on different domains) requires SameSite=None,
  // which is only valid when Secure is also set. Lax is fine for local dev.
  secure: isProd,
  sameSite: isProd ? ('none' as const) : ('lax' as const),
  path: '/',
};

/**
 * Resolve the cookie `Domain`.
 *
 * Default is HOST-ONLY (no Domain attribute): the cookie binds to whatever host
 * issued `Set-Cookie`. This is the only correct option when the frontend and
 * backend live on unrelated registrable domains (e.g. `*.vercel.app` calling a
 * `*.trycloudflare.com` API), because there is no shared parent domain to scope
 * the cookie to — emitting any Domain there makes the browser reject the cookie
 * ("Domain attribute was invalid with regards to the current host url").
 *
 * Set COOKIE_DOMAIN explicitly ONLY when frontend and backend share a parent
 * domain and you want the cookie shared across subdomains (e.g. `.example.com`).
 * The value must be a bare hostname — no scheme, port, or path. Anything that
 * looks malformed is ignored (falls back to host-only) to avoid silently
 * emitting a Domain the browser will reject.
 */
function resolveCookieDomain(): string | undefined {
  const raw = process.env.COOKIE_DOMAIN?.trim();
  if (!raw) return undefined;

  // A valid Domain attribute is a bare host. Reject anything carrying a scheme,
  // port, path, or whitespace — those produce the "invalid Domain" rejection.
  const domain = raw.replace(/^\./, ''); // a leading dot is tolerated by browsers
  if (/[\s/:]/.test(domain) || domain === 'localhost') return undefined;

  return raw;
}

/** Cookie options for the current request, including an optional shared domain. */
function cookieOptions() {
  const domain = resolveCookieDomain();
  return domain ? { ...cookieBase, domain } : { ...cookieBase };
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ global: { ttl: 60_000, limit: 5 } }) // 5 attempts per minute per IP
  @ApiOperation({ summary: 'Login — returns short-lived access token + sets refresh cookie' })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(loginDto);
    const opts = cookieOptions();

    res.cookie(ACCESS_COOKIE, result.accessToken, {
      ...opts,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie(REFRESH_COOKIE, result.refreshToken, {
      ...opts,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    return { message: result.message, user: result.user };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @SkipThrottle()
  @ApiOperation({ summary: 'Exchange a valid refresh token for a new token pair' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    if (!token) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        success: false, message: 'No refresh token provided',
      });
    }

    const result = await this.authService.refresh(token);
    const opts = cookieOptions();

    res.cookie(ACCESS_COOKIE, result.accessToken, {
      ...opts,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie(REFRESH_COOKIE, result.refreshToken, {
      ...opts,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return { message: result.message };
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke refresh token and clear cookies' })
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    if (token) await this.authService.logout(token);

    // Must match the domain/path the cookies were set with, or the browser
    // won't clear them.
    const domain = resolveCookieDomain();
    const clearOpts = domain ? { path: '/', domain } : { path: '/' };
    res.clearCookie(ACCESS_COOKIE,  clearOpts);
    res.clearCookie(REFRESH_COOKIE, clearOpts);

    return { message: 'Logout successful' };
  }

  @Patch('reset-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password using current password' })
  async resetPassword(
    @CurrentUser() user: CurrentUserData,
    @Body('oldPassword') oldPassword: string,
    @Body('newPassword') newPassword: string,
  ) {
    return this.authService.resetPassword(user.id, oldPassword, newPassword);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@CurrentUser() user: CurrentUserData) {
    return this.authService.getProfile(user.id);
  }
}
