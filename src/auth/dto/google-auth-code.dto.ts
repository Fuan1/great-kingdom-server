import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GoogleAuthCodeDto {
  @ApiProperty({ description: 'Google Authorization Code' })
  @IsNotEmpty()
  @IsString()
  code: string;
}
