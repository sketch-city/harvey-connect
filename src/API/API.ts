import { AsyncStorage } from 'react-native'
export class Need extends Object {
    updatedBy: string
    timestamp: Date
    locationName: string
    locationAddress: string
    longitude: number
    latitude: number
    contactForThisLocationName: string
    contactForThisLocationPhone: string
    areVolunteersNeeded: boolean
    tellUsAboutVolunteerNeeds: string
    areSuppliesNeeded: boolean
    tellUsAboutSupplyNeeds: string
    anythingElseYouWouldLikeToTellUs: string

    constructor(json: {}) {
        super()
        this.updatedBy = json['updated_by']
        this.timestamp = json['timestamp']
        this.locationName = json['location_name']
        this.locationAddress = json['location_address']
        this.longitude = json['longitude']
        this.latitude = json['latitude']
        this.contactForThisLocationName = json['contact_for_this_location_name']
        this.contactForThisLocationPhone = json['contact_for_this_location_phone']
        this.areVolunteersNeeded = json['are_volunteers_needed']
        this.tellUsAboutVolunteerNeeds = json['tell_us_about_the_volunteer_needs']
        this.areSuppliesNeeded = json['are_supplies_needed']
        this.tellUsAboutSupplyNeeds = json['tell_us_about_the_supply_needs']
        this.anythingElseYouWouldLikeToTellUs = json['anything_else_you_would_like_to_tell_us']
    }

    coordinate = () => {
        return {
            longitude: this.longitude,
            latitude: this.latitude
        }
    }
}

export class Category extends Object {
    labor: any[];
    equipment: string[];
    supplies: string[];
    transportation: string[];
    housing: any[];
    food: string[];
}

export class API {
    public static getNeeds = async () => {
        let needs = await fetch('https://api.harveyneeds.org/api/v1/connect/markers')
        let json = await needs.json()
        await AsyncStorage.setItem('needs', JSON.stringify(json))
        return new Promise<Need[]>((resolve) => {
            let final = json["markers"].map((val) => new Need(val))
            resolve([])
        })
    }

    public static getCategories = async () => {
        let categories = await fetch('https://api.harveyneeds.org/api/v1/connect/categories')
        let json = await categories.json()
        await AsyncStorage.setItem('categories', JSON.stringify(json))
        return new Promise<Category[]>((resolve) => {
            let final = json["categories"].map((val) => {
                let cat = new Category(val)
                if (cat.labor) {
                    let specialized = cat.labor[7].specialized
                    cat.labor[7] = specialized
                }
                //TODO: Address this mapping concern after api's are updated
                // if (cat.housing) {
                //     let petTypes = cat.housing[2]
                //     cat.housing[2] = petTypes
                // }
                return cat
            })
            resolve(final)
        })
    }
}



// https://api.harveyneeds.org/api/v1/connect/categories