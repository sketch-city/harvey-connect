import React from 'react';
import { AsyncStorage, PermissionsAndroid } from 'react-native';
import { compose, createStore } from 'redux';
import { Provider } from 'react-redux';
import { MainView } from './components/MainView';
import { UUIDHelper } from './API/UUIDHelper';
import { AndroidPermissionHelper } from './API/AndroidPermissionHelper';

export default function AppContainer() {
    //TODO:sample code of how to check for permission as app lunch layer, we can only request permission when its needed instead and take this code out.
    // AndroidPermissionHelper.checkLocationPermission().then((value) => {
    //     if (value === PermissionsAndroid.RESULTS.DENIED) {
    //         AndroidPermissionHelper.requestLocationPermission();
    //     }
    // });

    UUIDHelper.setupUUIDIfNeeded().then((value) => {
        console.log(`created uuid: ${value}`)
    }).catch((error) => {
        console.log('got error generating uuid')
    })
    return (
        <MainView />
    );
}
