import React, { Component } from 'react';
import { View, Text, Image, StyleSheet, TextInput, KeyboardTypeIOS, KeyboardType } from 'react-native';
import { MarkerValue } from './HavesView'
import { Colors } from './Colors'
import FAIcon from 'react-native-vector-icons/FontAwesome';

interface Props {
    placeholder: string,
    value?: string,
    keyboardType?: KeyboardType | KeyboardTypeIOS,
    markerValue: MarkerValue,
    textChanged: (text: string, markerValue: MarkerValue) => void

}

interface State {
    currentText: string
}
export class TextCell extends Component<Props, State> {
    constructor(props) {
        super(props)
        this.state = {
            currentText: this.props.value
        }
    }
    iconForValue = () => {
        switch (this.props.markerValue) {
            case MarkerValue.Phone: return <FAIcon name={'phone'} size={15} style={styles.actionButtonIcon} />
            case MarkerValue.Address: return <FAIcon name={'map-marker'} size={15} style={styles.actionButtonIcon} />
            case MarkerValue.Name: return <FAIcon name={'user-circle'} size={15} style={styles.actionButtonIcon} />
            case MarkerValue.Description: return <FAIcon name={'heart'} size={15} style={[styles.actionButtonIcon, { alignSelf: 'flex-start', marginTop: 10 }]} />
        }
    }

    render() {
        let multiline = this.props.markerValue === MarkerValue.Description
        let viewHeight = multiline ? 100 : 45

        return (
            <View style={{ height: viewHeight, flexDirection: 'row', alignItems: 'center' }}>
                {this.iconForValue()}
                <TextInput
                    placeholder={this.props.placeholder}
                    value={this.props.value}
                    keyboardType={this.props.keyboardType}
                    multiline={multiline}
                    style={{ alignSelf: 'center', fontSize: 15, flex: 1, height: viewHeight, color: Colors.needText }}
                    onChangeText={(text) => {
                        this.props.textChanged(text, this.props.markerValue)
                    }
                    }
                ></TextInput>
            </View >
        )
    }
}

const styles = StyleSheet.create({
    actionButtonIcon: {
        color: '#A2AEB6',
        marginRight: 10
    }
});
