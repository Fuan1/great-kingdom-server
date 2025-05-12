import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';
export class TokenResponseDto {
  @ApiProperty({ description: 'JWT access token' })
  accessToken: string;

  @ApiProperty({ description: 'Token expiration time in milliseconds' })
  expiresIn: number;

  @ApiProperty({ description: 'User information' })
  user: User;
}
