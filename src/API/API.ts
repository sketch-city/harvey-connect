import { AsyncStorage } from 'react-native'
import { UUIDHelper } from './UUIDHelper';

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

export class CreateMarker extends Object {
    marker_type: string
    name: string
    categories: Object
    description: string
    phone: string
    data?: Object
    latitude: number
    longitude: number
    address: string
    email?: any
    resolved?: boolean
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

    public static saveNewMarker = async (item: CreateMarker) => {
        let post = null
        let uuid = await UUIDHelper.getUUID()
        let response = await fetch('https://api.harveyneeds.org/api/v1/connect/markers', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'DisasterConnect-Device-UUID': uuid
            },
            body: JSON.stringify(item)
        })

        if (response.status === 201) {
            let json = await response.json()
            return new Promise<Need>((resolve) => {
                let final = new Need(json)
                resolve(json)
            })
        } else {
            return new Promise<Need>((reslove, reject) => reject(new Error(`Got a bad status code: ${response.status}`)))
        }
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
                if (response.status === 201) {
                    response.json().then(function (data) {
                        post = data
                    })
                }
                else { throw new Error('Something went wrong on api server!') }
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

        let categoryDictionary = new KeyedCollection<any>()

        return new Promise<KeyedCollection<any>>((resolve) => {
            json["categories"].map((val) => {
                let keyName = Object.getOwnPropertyNames(val)[0]
                let values = val[keyName]

                categoryDictionary.Add(keyName, values)
            })

            resolve(categoryDictionary)
        })
    }
}


export interface IKeyedCollection<T> {
    Add(key: string, value: T);
    ContainsKey(key: string): boolean;
    Count(): number;
    Item(key: string): T;
    Keys(): string[];
    Remove(key: string): T;
    Values(): T[];
}

export class KeyedCollection<T> implements IKeyedCollection<T> {
    private items: { [index: string]: T } = {};

    private count: number = 0;

    public ContainsKey(key: string): boolean {
        return this.items.hasOwnProperty(key);
    }

    public Count(): number {
        return this.count;
    }

    public Add(key: string, value: T) {
        if (!this.items.hasOwnProperty(key)) {
            this.count++;
        }

        this.items[key] = value;
    }

    public Remove(key: string): T {
        var val = this.items[key];
        delete this.items[key];
        this.count--;
        return val;
    }

    public Item(key: string): T {
        return this.items[key];
    }

    public Keys(): string[] {
        var keySet: string[] = [];

        for (var prop in this.items) {
            if (this.items.hasOwnProperty(prop)) {
                keySet.push(prop);
            }
        }

        return keySet;
    }

    public Values(): T[] {
        var values: T[] = [];

        for (var prop in this.items) {
            if (this.items.hasOwnProperty(prop)) {
                values.push(this.items[prop]);
            }
        }

        return values;
    }
}