import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser, RequestUser } from '../common/current-user.decorator';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { AuthService } from './auth.service';
import { GoogleLoginDto } from './dto/google-login.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateAvatarDto } from './dto/update-avatar.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Dang ky tai khoan moi' })
  async register(@Body() dto: RegisterDto) {
    const data = await this.authService.register(dto);
    return { success: true, data, message: 'Dang ky thanh cong' };
  }

  @Post('login')
  @ApiOperation({ summary: 'Dang nhap bang email/mat khau' })
  async login(@Body() dto: LoginDto) {
    const data = await this.authService.login(dto);
    return { success: true, data, message: 'Dang nhap thanh cong' };
  }

  @Post('google')
  @ApiOperation({ summary: 'Dang nhap bang Google OAuth' })
  async googleLogin(@Body() dto: GoogleLoginDto) {
    const data = await this.authService.googleLogin(dto);
    return { success: true, data, message: 'Dang nhap Google thanh cong' };
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Lam moi access token' })
  async refresh(@Body() dto: RefreshTokenDto) {
    const data = await this.authService.refresh(dto);
    return { success: true, data, message: 'Lam moi token thanh cong' };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Dang xuat' })
  async logout(@CurrentUser() user: RequestUser) {
    const data = await this.authService.logout(user.userId);
    return { success: true, data, message: 'Dang xuat thanh cong' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lay thong tin nguoi dung hien tai' })
  async me(@CurrentUser() user: RequestUser) {
    const data = await this.authService.me(user.userId);
    return { success: true, data };
  }

  @Put('me/avatar')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cap nhat avatar' })
  async updateAvatar(@CurrentUser() user: RequestUser, @Body() dto: UpdateAvatarDto) {
    const data = await this.authService.updateAvatar(user.userId, dto);
    return { success: true, data, message: 'Cap nhat avatar thanh cong' };
  }

  @Put('me/settings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cap nhat cai dat nguoi dung' })
  async updateSettings(@CurrentUser() user: RequestUser, @Body() dto: UpdateSettingsDto) {
    const data = await this.authService.updateSettings(user.userId, dto);
    return { success: true, data, message: 'Cap nhat cai dat thanh cong' };
  }
}
