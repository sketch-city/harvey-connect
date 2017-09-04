import { AsyncStorage } from 'react-native'

export class Need extends Object {
    id: number
    markerType: string
    name: string
    description: string
    phone: string
    category: string
    latitude: number
    longitude: number
    address: string
    email?: any
    updatedAt: Date

    constructor(json: {}) {
        super()
        this.markerType = json['marker_type']
        this.updatedAt = json['updated_at']
        this.id = json['id']
        this.name = json['name']
        this.description = json['description']
        this.phone = json['phone']
        this.category = json['category']
        this.latitude = json['latitude']
        this.longitude = json['longitude']
        this.address = json['address']
        this.email = json['email']
    }

    coordinate = () => {
        return {
            longitude: this.longitude,
            latitude: this.latitude
        }
    }
}

export class Marker extends Object {
    id: number
    marker_type: string
    name: string
    description: string
    resolved: boolean
    phone: string
    category: string
    latitude: number
    longitude: number
    address: string
    email?: any
    updated_at: Date

    coordinate = () => {
        return {
            longitude: this.longitude,
            latitude: this.latitude
        }
    }
}

export class Category extends Object {
    labor: any[]
    equipment: string[]
    supplies: string[]
    transportation: string[]
    housing: any[]
    food: string[]
}

export class API {
    public static getNeeds = async () => {
        let needs = await fetch('https://api.harveyneeds.org/api/v1/connect/markers')
        let json = await needs.json()
        await AsyncStorage.setItem('needs', JSON.stringify(json))

        return new Promise<Need[]>((resolve) => {
            let final = json["markers"].map((val) => new Need(val))
            resolve(final)
        })
    }

    public static saveNewMarker = async (item: Marker) => {
        let post = null
        await fetch('https://api.harveyneeds.org/api/v1/connect/markers', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(item)
        })
            .then((response) => {
                if (response.status == 201) {
                    response.json().then(function (data) {
                        post = data
                    })
                }
                else throw new Error('Something went wrong on api server!')
            })
            .catch(function (error) {
                console.error(error)
            })

        return new Promise<Need>((resolve) => {
            let final = new Need(post)
            resolve(final)
        })
    }

    public static updateMarker = async (item: Marker) => {
        let url = 'https://api.harveyneeds.org/api/v1/connect/markers/' + item.id
        let post = null
        await fetch(url, {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(item)
        })
            .then((response) => {
                if (response.status == 201) {
                    response.json().then(function (data) {
                        post = data
                    })
                }
                else throw new Error('Something went wrong on api server!')
            })
            .catch(function (error) {
                console.error(error)
            })

        return new Promise<Need>((resolve) => {
            let final = new Need(post)
            resolve(final)
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
                return cat
            })
            resolve(final)
        })
    }
}
