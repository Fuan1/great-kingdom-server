import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({ description: 'User ID' })
  id: string;

  @ApiProperty({ description: 'User email' })
  email: string;

  @ApiProperty({ description: 'User name' })
  name: string;

  @ApiProperty({ description: 'User profile picture URL', required: false })
  picture?: string;
}

export class AuthResponseDto {
  @ApiProperty({ description: 'User information' })
  user: UserDto;

  @ApiProperty({ description: 'True if user is authenticated', default: true })
  isAuthenticated: boolean = true;
}
