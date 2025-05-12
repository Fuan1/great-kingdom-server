import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';

@Injectable()
export class GoogleStrategy {
  private googleClient: OAuth2Client;

  constructor(private readonly configService: ConfigService) {
    this.googleClient = new OAuth2Client(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
      this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
      this.configService.get<string>('GOOGLE_CALLBACK_URL'),
    );
  }

  async getTokens(code: string) {
    try {
      const { tokens } = await this.googleClient.getToken(code);
      return tokens;
    } catch (error) {
      Logger.error(error);
      throw new UnauthorizedException('Failed to authenticate with Google');
    }
  }

  async getUserInfo(accessToken: string) {
    const response = await axios.get(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );
    return response.data;
  }
}
