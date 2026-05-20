export enum OrderStatus {
    REQUESTED = 'REQUESTED',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED',
    READY = 'READY',
    PICKED_UP = 'PICKED_UP',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED'
}

export const OrderTransition = {
  REQUESTED: ['ACCEPTED', 'REJECTED', 'CANCELLED'],
  ACCEPTED: ['READY', 'CANCELLED'],
  READY: ['PICKED_UP'],
  PICKED_UP: ['DELIVERED'],
  DELIVERED: [],
  REJECTED: [],
  CANCELLED: [],
};

export enum PaymentStatus{
    NOT_REQUIRED='NOT_REQUIRED',
    PENDING='PENDING',
    PAID='PAID',
    FAILED='FAILED',
    REFUNDED='REFUNDED',
    EXPIRED='EXPIRED',
}
export enum DeliveryType {
    HOME_DELIVERY = 'HOME_DELIVERY',
    PICK_UP = 'PICK_UP'
}


