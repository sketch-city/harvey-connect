import React from 'react';
import {MainView} from './components/MainView';
import {UUIDHelper} from './API/UUIDHelper';

export default function AppContainer() {
  UUIDHelper.setupUUIDIfNeeded()
    .then((value) => {
      console.log(`created uuid: ${value}`);
    })
    .catch((error) => {
      console.log('got error generating uuid');
    });
  return <MainView />;
}
