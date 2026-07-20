import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { AdminOnly } from "../common/decorators/admin-only.decorator";
import { CategoriesService } from "./categories.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@Controller("categories")
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @Post()
  @AdminOnly()
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  @Patch(":id")
  @AdminOnly()
  update(@Param("id") id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(id, dto);
  }

  @Delete(":id")
  @AdminOnly()
  remove(@Param("id") id: string) {
    return this.categoriesService.remove(id);
  }
}
