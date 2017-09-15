import React, { Component, PureComponent } from 'react'
import { View } from 'react-native'
import { Colors } from './Colors'
export class Separator extends PureComponent<{}, {}> {
    render() {
        return (
            <View style={{ height: 1, flex: 1, backgroundColor: Colors.separatorColor }}></View>
        )
    }
}