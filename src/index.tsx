import React from 'react';
import { AsyncStorage, PermissionsAndroid } from 'react-native';
import { compose, createStore } from 'redux';
import { Provider } from 'react-redux';
import { MainView } from './components/MainView';
import { UUIDHelper } from './API/UUIDHelper';

export default function AppContainer() {
    UUIDHelper.setupUUIDIfNeeded().then((value) => {
        console.log(`created uuid: ${value}`)
    }).catch((error) => {
        console.log('got error generating uuid')
    })
    return (
        <MainView />
    );
}
