import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';

export class NeedsView extends Component<{}, {}> {
    render() {
        return (
            <View style={styles.container}>
                <Text style={styles.description}>I HAZ NEEDZ!</Text>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    description: {
      marginBottom: 20,
      fontSize: 18,
      textAlign: 'center',
      color: '#656565'
    },
    container: {
      padding: 30,
      marginTop: 65,
      alignItems: 'center'
    },
  });