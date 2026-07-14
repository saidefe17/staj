import { Body, Controller, Delete, Get, Param, Post, UseGuards } from "@nestjs/common";
import { FirebaseAuthGuard } from "../common/guards/firebase-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AuthenticatedUser } from "../common/types/authenticated-request";
import { CartService } from "./cart.service";
import { UpsertCartItemDto } from "./dto/upsert-cart-item.dto";

@Controller("cart")
@UseGuards(FirebaseAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@CurrentUser() user: AuthenticatedUser) {
    return this.cartService.getCart(user.uid);
  }

  @Post("items")
  upsertItem(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpsertCartItemDto) {
    return this.cartService.upsertItem(user.uid, dto.productId, dto.quantity);
  }

  @Delete("items/:productId")
  removeItem(@CurrentUser() user: AuthenticatedUser, @Param("productId") productId: string) {
    return this.cartService.removeItem(user.uid, productId);
  }

  @Delete()
  clear(@CurrentUser() user: AuthenticatedUser) {
    return this.cartService.clear(user.uid);
  }
}
