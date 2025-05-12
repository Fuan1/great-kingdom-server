// src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  HttpStatus,
  HttpCode,
  Get,
  UseGuards,
  Request,
  Headers,
  Logger,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { GoogleAuthCodeDto, TokenResponseDto, AuthResponseDto } from './dto';
import { JwtAuthGuard } from './guard/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('google/callback')
  @ApiOperation({ summary: 'Process Google OAuth authorization code' })
  @ApiResponse({
    status: 200,
    description: 'Authentication successful',
    type: TokenResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Authentication failed' })
  @HttpCode(HttpStatus.OK)
  async googleCallback(
    @Body() googleAuthCodeDto: GoogleAuthCodeDto,
  ): Promise<TokenResponseDto> {
    try {
      return await this.authService.googleLogin(googleAuthCodeDto.code);
    } catch (error) {
      throw new UnauthorizedException('Failed to authenticate with Google');
    }
  }

  @Get('verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify token validity' })
  @ApiResponse({
    status: 200,
    description: 'Valid token',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid token' })
  async verifyToken(@Request() req) {
    return {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      picture: req.user.picture,
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  @HttpCode(HttpStatus.OK)
  async logout() {
    return await this.authService.logout();
  }
}
