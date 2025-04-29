import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { OAuth2Client } from 'google-auth-library';
import { User } from '@prisma/client';
import { GooglePayloadDto, CreateUserDto, TokenResponseDto } from './dto';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.googleClient = new OAuth2Client(
      this.configService.get('GOOGLE_CLIENT_ID'),
    );
  }

  async verifyGoogleToken(idToken: string): Promise<GooglePayloadDto> {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: this.configService.get('GOOGLE_CLIENT_ID'),
      });

      const payload = ticket.getPayload() as GooglePayloadDto | undefined;

      if (!payload) {
        throw new Error('Invalid payload');
      }

      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid Google token');
    }
  }

  async findOrCreateUser(userData: CreateUserDto): Promise<User> {
    const user = await this.prisma.user.upsert({
      where: { email: userData.email },
      update: {
        name: userData.name,
        googleId: userData.googleId,
        picture: userData.picture,
      },
      create: {
        email: userData.email,
        name: userData.name,
        googleId: userData.googleId,
        picture: userData.picture,
      },
    });

    return user;
  }

  async generateToken(user: User): Promise<TokenResponseDto> {
    const expiresIn = 60 * 60 * 24; // 24시간

    const accessToken = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
      },
      {
        expiresIn,
      },
    );

    return {
      accessToken,
      expiresIn: expiresIn * 1000, // milliseconds로 변환
    };
  }
}
