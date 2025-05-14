import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    items: [
      {
        name: {
          type: String,
          required: true,
        },
        quantity: {
          required: true,
          type: Number,
        },
        price: {
          required: true,
          type: Number,
        },
        id: {
          required: true,
          ref: "Product",
          type: mongoose.Schema.Types.ObjectId,
        },
      },
    ],
    shippingInformation: {
      type: String,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    isDelivered: {
      type: Boolean,
      default: false,
      required: true,
    },
    deliveredAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
