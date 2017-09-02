import React from 'react';
import { compose, createStore } from 'redux';
import { Provider } from 'react-redux';

import { MainView } from './components/MainView';
export default function AppContainer() {
    return (
        <MainView />
    );
}