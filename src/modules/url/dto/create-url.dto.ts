import { IsUrl } from 'class-validator';

export class CreateUrlDto {
  @IsUrl()
  destination: string;
}
