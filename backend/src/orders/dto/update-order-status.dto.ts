import { IsIn } from "class-validator";
import { OrderStatus } from "../order.entity";

const ORDER_STATUSES: OrderStatus[] = ["processing", "shipped", "delivered", "cancelled"];

export class UpdateOrderStatusDto {
  @IsIn(ORDER_STATUSES)
  status!: OrderStatus;
}
