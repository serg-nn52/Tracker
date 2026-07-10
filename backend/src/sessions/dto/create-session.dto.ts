import { IsISO8601, IsInt, IsNotEmpty, Min } from 'class-validator';

export class CreateSessionDto {
  @IsISO8601()
  @IsNotEmpty()
  startTime: string;

  @IsISO8601()
  @IsNotEmpty()
  endTime: string;

  @IsInt()
  @Min(1)
  duration: number; // в миллисекундах

  @IsISO8601()
  @IsNotEmpty()
  date: string; // YYYY-MM-DD
}
