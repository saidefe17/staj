import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class SyncProfileDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  fullName!: string;
}
