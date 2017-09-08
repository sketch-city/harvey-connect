import React, { Component, PureComponent } from 'react'
import { View } from 'react-native'

export class Separator extends PureComponent<{}, {}> {
    render() {
        return (
            <View style={{ height: 1, flex: 1, backgroundColor: 'rgba(0,0,0,0.1)' }}></View>
        )
    }
}