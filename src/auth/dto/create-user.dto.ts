import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: 'User email' })
  email: string;

  @ApiProperty({ description: 'User name' })
  name: string;

  @ApiProperty({ description: 'Google ID' })
  googleId: string;

  @ApiProperty({ description: 'User profile picture URL', required: false })
  picture?: string;
}
