import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';

export class AuthResponseDto {
  @ApiProperty({ description: 'User information' })
  user: User;

  @ApiProperty({ description: 'True if user is authenticated', default: true })
  isAuthenticated: boolean = true;
}
