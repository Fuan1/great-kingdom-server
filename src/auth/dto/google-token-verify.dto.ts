import { ApiProperty } from '@nestjs/swagger';

export class GoogleTokenVerifyDto {
  @ApiProperty({ description: 'Google ID token' })
  idToken: string;

  @ApiProperty({ description: 'Google access token' })
  accessToken: string;
}
