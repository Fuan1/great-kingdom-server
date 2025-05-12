import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { User } from '@prisma/client';
import { CreateUserDto, TokenResponseDto } from './dto';
import { GoogleStrategy } from './strategies/google.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly googleStrategy: GoogleStrategy,
  ) {}

  async googleLogin(code: string): Promise<TokenResponseDto> {
    try {
      // 1. Get tokens from authorization code
      const tokens = await this.googleStrategy.getTokens(code);

      // 2. Get user info using access token
      if (!tokens.access_token) {
        throw new UnauthorizedException('Access token not found');
      }
      const userInfo = await this.googleStrategy.getUserInfo(
        tokens.access_token,
      );

      // 3. Save or update user information in DB
      const user = await this.findOrCreateUser({
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        googleId: userInfo.sub,
      });

      // 4. Generate JWT token
      const jwtToken = this.generateToken(user);

      // Token expiration time (24 hours)
      const expiresIn = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

      return {
        accessToken: jwtToken,
        expiresIn: expiresIn,
        user: user,
      };
    } catch (error) {
      throw new UnauthorizedException('Failed to authenticate with Google');
    }
  }

  async findOrCreateUser(userData: CreateUserDto): Promise<User> {
    let user = await this.prismaService.user.findUnique({
      where: { email: userData.email },
    });

    if (!user) {
      user = await this.prismaService.user.create({
        data: userData,
      });
    } else {
      // Update existing user information
      user = await this.prismaService.user.update({
        where: { id: user.id },
        data: {
          name: userData.name,
          picture: userData.picture,
          googleId: userData.googleId,
        },
      });
    }

    return user;
  }

  generateToken(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
    };
    return this.jwtService.sign(payload);
  }

  async verifyToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.prismaService.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  // Logout handling (token blacklist processing and other logic can be added)
  async logout() {
    // Here we just return a simple success message
    // as we use client-side token deletion
    return { success: true };
  }
}
