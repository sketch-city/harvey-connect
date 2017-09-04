import React, { Component } from 'react';
import {
    AppRegistry,
    Text,
} from 'react-native';
import { TabNavigator } from 'react-navigation';
import { MainView } from './MainView';
import { NeedsView } from './NeedsView';
import { HavesView } from './HavesView';
import { MatchesView } from './MatchesView';

export const RootTabNavigator = TabNavigator({
    Map: { screen: MainView },
    "I Need": { screen: NeedsView },
    "I Have": { screen: HavesView },
});
