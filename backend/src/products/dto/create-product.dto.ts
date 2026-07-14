import { IsNotEmpty, IsNumber, IsPositive, IsString, MaxLength } from "class-validator";

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  category!: string;

  @IsNumber()
  @IsPositive()
  price!: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  description!: string;
}
