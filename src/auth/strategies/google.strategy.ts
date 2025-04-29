// src/auth/strategies/google.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { OAuth2Client } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';

interface GoogleUser {
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
  accessToken: string;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private googleClient: OAuth2Client;

  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID')!,
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET')!,
      callbackURL: 'http://localhost:3000/api/auth/callback/google',
      scope: ['email', 'profile'],
      passReqToCallback: true,
    });

    this.googleClient = new OAuth2Client(
      configService.get('GOOGLE_CLIENT_ID'),
      configService.get('GOOGLE_CLIENT_SECRET'),
    );
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ): Promise<GoogleUser> {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: accessToken,
        audience: this.configService.get('GOOGLE_CLIENT_ID'),
      });

      const payload = ticket.getPayload();

      if (!payload) {
        throw new UnauthorizedException('Invalid Google token payload');
      }

      return {
        email: payload.email!,
        firstName: payload.given_name!,
        lastName: payload.family_name!,
        picture: payload.picture!,
        accessToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Failed to validate Google token');
    }
  }
}
