import { ApiProperty } from '@nestjs/swagger';

export class BaseModelDto {
  @ApiProperty({ description: 'Unique identifier' })
  id: string;

  @ApiProperty({ description: 'Record creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Record last updated timestamp' })
  updatedAt?: Date;

  @ApiProperty({ description: 'Record deletion timestamp' })
  deletedDate?: Date;
}
