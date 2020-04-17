import {PermissionsAndroid, PermissionStatus} from 'react-native';
import {strings} from '../localization/Strings';

export class LocationPermissionHelper {
  public static async requestLocationPermissionIfNecessary(): Promise<boolean> {
    try {
      const granted = (await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: strings.locationPermissionRequestTitle,
          message: strings.locationPermissionRequestMessage,
        },
      )) as PermissionStatus;

      if (granted === 'granted') {
        return new Promise<boolean>((resolve) => resolve(true));
      } else {
        return new Promise<boolean>((resolve) => resolve(false));
      }
    } catch (err) {
      console.warn(err);
      return new Promise<boolean>((resolve, reject) => reject(err));
    }
  }
}
