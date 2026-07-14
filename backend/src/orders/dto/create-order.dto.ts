import { IsIn } from "class-validator";
import { PaymentMethod } from "../order.entity";

const PAYMENT_METHODS: PaymentMethod[] = ["card", "transfer"];

export class CreateOrderDto {
  @IsIn(PAYMENT_METHODS)
  paymentMethod!: PaymentMethod;
}
