import AsyncStorage from '@react-native-community/async-storage';
import {UUIDHelper} from './UUIDHelper';

let googleMapAPIUrl = 'https://maps.googleapis.com/maps/api/geocode/json?';
let googleMapsAPIKey = '&key=AIzaSyBKrllwH0zqn33v83YR-gbDGYPKOA5hOt0';
let addressFilter = '&location_type=ROOFTOP&result_type=street_address';
let latlngFilter = '&location_type=ROOFTOP&result_type=premise';

export class Need extends Object {
  id: number;
  markerType: string;
  name: string;
  description: string;
  phone: string;
  categories: Object;
  latitude: number;
  longitude: number;
  address: string;
  email?: any;
  data: Object;
  updatedAt: Date;
  resolved: boolean;

  constructor(json: {}) {
    super();

    this.markerType = json['marker_type'];
    this.updatedAt = json['updated_at'];
    this.id = json['id'];
    this.data = json['data'];
    this.name = json['name'];
    this.description = json['description'];
    this.phone = json['phone'];
    this.categories = json['categories'];
    this.latitude = json['latitude'];
    this.longitude = json['longitude'];
    this.address = json['address'];
    this.email = json['email'];
    this.resolved = json['resolved'];
  }

  coordinate = () => {
    return {
      longitude: this.longitude,
      latitude: this.latitude,
    };
  };

  distanceToCoordinate = (other: {
    latitude: number;
    longitude: number;
  }): number => {
    let dLat = other.latitude - this.latitude;
    let dLon = other.longitude - this.longitude;
    return Math.sqrt(dLat * dLat + dLon * dLon);
  };
}

export class CreateMarker extends Object {
  id?: number;
  marker_type: string;
  name: string;
  categories: Object;
  description: string;
  phone: string;
  data?: Object;
  latitude: number;
  longitude: number;
  address: string;
  email?: any;
  resolved?: boolean;
}

export class Marker extends Object {
  id: number;
  marker_type: string;
  name: string;
  description: string;
  resolved: boolean;
  phone: string;
  category: string;
  latitude: number;
  longitude: number;
  address: string;
  email?: any;
  updated_at: Date;

  coordinate = () => {
    return {
      longitude: this.longitude,
      latitude: this.latitude,
    };
  };
}

export class API {
  public static getNeeds = async () => {
    let needs = await fetch(
      'https://disasterconnect.herokuapp.com/api/v1/connect/markers',
    );
    let json = await needs.json();
    await AsyncStorage.setItem('needs', JSON.stringify(json));

    return new Promise<Need[]>((resolve) => {
      let final = json['markers'].map((val) => new Need(val));
      resolve(final);
    });
  };

  public static getMyMarkers = async () => {
    let uuid = await UUIDHelper.getUUID();
    let needs = await fetch(
      `https://disasterconnect.herokuapp.com/api/v1/connect/markers?device_uuid=${uuid}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'DisasterConnect-Device-UUID': uuid,
        },
      },
    );
    let json = await needs.json();
    await AsyncStorage.setItem('myMarkers', JSON.stringify(json));

    return new Promise<Need[]>((resolve) => {
      let final = json['markers'].map((val) => new Need(val));
      resolve(final);
    });
  };

  public static saveNewMarker = async (item: CreateMarker) => {
    let post = null;
    let uuid = await UUIDHelper.getUUID();
    let response = await fetch(
      'https://disasterconnect.herokuapp.com/api/v1/connect/markers',
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'DisasterConnect-Device-UUID': uuid,
        },
        body: JSON.stringify(item),
      },
    );

    if (response.status === 201) {
      let json = await response.json();
      return new Promise<Need>((resolve) => {
        let final = new Need(json);
        resolve(json);
      });
    } else {
      return new Promise<Need>((reslove, reject) =>
        reject(new Error(`Got a bad status code: ${response.status}`)),
      );
    }
  };

  public static updateMarker = async (item: CreateMarker) => {
    let url = `https://disasterconnect.herokuapp.com/api/v1/connect/markers/${item.id}`;
    let uuid = await UUIDHelper.getUUID();
    let response = await fetch(url, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'DisasterConnect-Device-UUID': uuid,
      },
      body: JSON.stringify(item),
    });
    if (response.status === 200) {
      let json = await response.json();
      return new Promise<Need>((resolve) => {
        let final = new Need(json);
        resolve(json);
      });
    } else {
      return new Promise<Need>((reslove, reject) =>
        reject(new Error(`Got a bad status code: ${response.status}`)),
      );
    }
  };

  public static flagMarker = async (id: number) => {
    let url = `https://disasterconnect.herokuapp.com/api/v1/connect/markers/${id}/flag`;
    let uuid = await UUIDHelper.getUUID();
    let response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'DisasterConnect-Device-UUID': uuid,
      },
    });
    if (response.status === 204) {
      return new Promise((resolve) => {
        resolve();
      });
    } else {
      return new Promise<Need>((reslove, reject) =>
        reject(new Error(`Got a bad status code: ${response.status}`)),
      );
    }
  };

  public static getCategories = async () => {
    let categories = await fetch(
      'https://disasterconnect.herokuapp.com/api/v1/connect/categories',
    );
    let json = await categories.json();
    await AsyncStorage.setItem('categories', JSON.stringify(json));

    let categoryDictionary = new KeyedCollection<any>();

    return new Promise<{categories: KeyedCollection<any>; all: any}>(
      (resolve) => {
        json['categories'].map((val) => {
          let keyName = Object.getOwnPropertyNames(val)[0];
          let values = val[keyName];

          categoryDictionary.Add(keyName, values);
        });

        resolve({categories: categoryDictionary, all: json});
      },
    );
  };

  public static getAddressFromLatLang = async (
    latitude: number,
    longitude: number,
  ) => {
    let reverseGeoCoding = await fetch(
      `${googleMapAPIUrl}latlng=${latitude},${longitude}${googleMapsAPIKey}`,
    );
    let json = await reverseGeoCoding.json();
    return new Promise<string>((resolve, reject) => {
      if (json['results'][0].formatted_address) {
        resolve(json['results'][0].formatted_address);
      } else {
        reject(new Error('Cant get address'));
      }
    });
  };

  public static getLatLangFromAddress = async (address: string) => {
    let reverseGeoCoding = await fetch(
      `${googleMapAPIUrl}address=${address}${addressFilter}${googleMapsAPIKey}`,
    );
    let json = await reverseGeoCoding.json();

    return new Promise<{lat: number; lng: number}>((resolve, reject) => {
      if (json['results'][0].geometry.location) {
        resolve(json['results'][0].geometry.location);
      } else {
        reject(new Error('Unable to get coordinates from address.'));
      }
    });
  };
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
  private items: {[index: string]: T} = {};

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
