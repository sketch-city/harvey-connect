import {LocationPermissionHelper} from './LocationPermissionHelper';
import Geolocation from '@react-native-community/geolocation';

import {Platform} from 'react-native';

export class LocationManager {
  public static async getCurrentPosition(): Promise<Position> {
    const hasPermission = (await LocationPermissionHelper.requestLocationPermissionIfNecessary()) as boolean;
    return new Promise<Position>((resolve, reject) => {
      if (hasPermission) {
        const options = {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 1000,
        };
        Geolocation.getCurrentPosition(
          (pos) => resolve(pos),
          (err) => reject(err),
          options,
        );
      } else {
        reject(new Error('Location permission denied.'));
      }
    });
  }
}
