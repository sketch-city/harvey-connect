import { AsyncStorage, PermissionsAndroid } from 'react-native';

export class AndroidPermissionHelper {

    public static requestLocationPermission = async () => {
        try {
            let existingGranted = await AsyncStorage.getItem('locationPermission');
            const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, { 'title': 'Location for needs', 'message': 'App needs access to your location ' + 'so you can find others in need or request your needs.' });
            await AsyncStorage.setItem('locationPermission', granted);
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                console.log("You can use the find my location function");
            } else {
                console.log("Location permission denied");
            }
        } catch (err) {
            console.warn(err)
        }
    };

    public static checkLocationPermission = async () => {
        try {
            let existingGranted = await AsyncStorage.getItem('locationPermission');
            if (existingGranted === undefined || existingGranted === null || existingGranted === '') {
                let granted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)
                    .then((res) => { return res ? PermissionsAndroid.RESULTS.GRANTED : PermissionsAndroid.RESULTS.DENIED });
                await AsyncStorage.setItem('locationPermission', granted);
                return new Promise<string>((resolve) => resolve(granted));
            } else {
                return AsyncStorage.getItem('locationPermission');
            }
        } catch (error) {
            return new Promise<string>((resolve, reject) => reject(error));
        }
    }
}