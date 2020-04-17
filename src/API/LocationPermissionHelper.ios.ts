export class LocationPermissionHelper {
  public static async requestLocationPermissionIfNecessary(): Promise<boolean> {
    return new Promise<boolean>((resolve) => resolve(true));
  }
}
