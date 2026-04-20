import { UUID } from "node:crypto"

export interface Location{
    longitude:number
    latitude:number
}


export interface SellerProfileData{
    sellerId:UUID
    location : Location
    deliveryRadius:number
    businessType:string
}

export interface SellerLocationData{
    sellerId:UUID,
    location : Location
}

export interface SellerProfile{
    id:string
    user_id:string
    latitude:number
    longitude:number
    delivery_radius_km:number
    business_type:string | null
    rating_avg:number
    total_ratings:number
    is_active:boolean
    created_at:Date
    updated_at:Date

}
