export enum OrderStatus {
    REQUESTED = 'REQUESTED',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED',
    READY = 'READY',
    PICKED_UP = 'PICKED_UP',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED'
}

export enum DeliveryType {
    HOME_DELIVERY = 'HOME_DELIVERY',
    PICK_UP = 'PICK_UP'
}

export const OrderTransition = {
    REQUESTED: ['ACCEPTED', 'REJECTED', 'CANCELLED'],
    ACCEPTED: ['READY', 'CANCELLED'],
    READY: ['PICKED_UP'],
    PICKED_UP: ['DELIVERED'],
    DELIVERED: [],
    REJECTED: [],
    CANCELLED: []
};
