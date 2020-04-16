import AsyncStorage from '@react-native-community/async-storage';
export class UUIDHelper {
  private static generateUUID = () => {
    // Public Domain/MIT
    var d = new Date().getTime();
    if (
      typeof performance !== 'undefined' &&
      typeof performance.now === 'function'
    ) {
      d += performance.now(); //use high-precision timer if available
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (
      c,
    ) {
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
  };

  public static getUUID = () => {
    return AsyncStorage.getItem('deviceID');
  };

  public static setupUUIDIfNeeded = async () => {
    try {
      let uuid = await AsyncStorage.getItem('deviceID');
      if (uuid === undefined || uuid === null || uuid === '') {
        let generated = UUIDHelper.generateUUID();
        await AsyncStorage.setItem('deviceID', generated);
        return new Promise<string>((resolve) => resolve(uuid));
      } else {
        return AsyncStorage.getItem('deviceID');
      }
    } catch (error) {
      return new Promise<string>((resolve, reject) => reject(error));
    }
  };
}
