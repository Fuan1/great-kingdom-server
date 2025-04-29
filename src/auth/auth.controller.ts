// src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GoogleTokenVerifyDto, AuthResponseDto } from './dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('google/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify Google token and create/update user' })
  @ApiResponse({ status: 200, description: 'Token verified successfully' })
  @ApiResponse({ status: 401, description: 'Invalid Google token' })
  async verifyGoogleToken(
    @Body() body: GoogleTokenVerifyDto,
  ): Promise<AuthResponseDto> {
    try {
      const googleUser = await this.authService.verifyGoogleToken(body.idToken);

      const user = await this.authService.findOrCreateUser({
        email: googleUser.email,
        name: `${googleUser.given_name} ${googleUser.family_name}`,
        googleId: googleUser.sub,
        picture: googleUser.picture,
      });

      const { accessToken, expiresIn } =
        await this.authService.generateToken(user);

      return {
        accessToken,
        expiresIn,
        user: {
          id: user.id,
          email: user.email,
          name: user.name || '',
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid Google token');
    }
  }
}
