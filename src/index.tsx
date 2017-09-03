import React from 'react';
import { compose, createStore } from 'redux';
import { Provider } from 'react-redux';

import { RootTabNavigator } from './components/TabView';
export default function AppContainer() {
    return (
        <RootTabNavigator />
    );
}