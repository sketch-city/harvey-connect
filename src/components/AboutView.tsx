import React, {Component} from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
  ImageBackground,
  Image,
} from 'react-native';
import {Need} from '../API/API';
import {Separator} from '../components/Separator';
import FAIcon from 'react-native-vector-icons/FontAwesome';

import Communications from 'react-native-communications';
import {Linking, Platform, Alert} from 'react-native';

import {
  TitleText,
  PlainText,
  ButtonText,
  Colors,
  dropShadowStyles,
  styles,
} from '../constants';
import {strings} from '../localization/Strings';
import Mailer from 'react-native-mail';

interface Props {
  cancelTapped: () => void;
}
interface State {}

export class AboutView extends Component<Props, State> {
  constructor(props) {
    super(props);
  }

  contactTapped = () => {
    Mailer.mail(
      {
        subject: 'Contact',
        recipients: [' connectapp@chaione.com'],
        body: ``,
        isHTML: true,
      },
      (error, event) => {
        if (error) {
          Alert.alert(
            'Error',
            'Could not send mail. Please send a mail to connectapp@chaione.com',
          );
        }
      },
    );
  };

  aboutText = () => {
    return strings.aboutDev;
  };
  render() {
    const {width, height} = Dimensions.get('window');
    return (
      <ImageBackground
        source={require('./../images/AboutNoCopy.png')}
        style={{width: width, height: height}}>
        <View
          style={{
            flex: 1,
            left: 0,
            right: 0,
            bottom: 20,
            position: 'absolute',
          }}>
          <Text
            style={{
              color: Colors.needText,
              fontWeight: '500',
              backgroundColor: 'rgba(0,0,0,0)',
              alignSelf: 'center',
              marginHorizontal: 20,
              textAlign: 'center',
              marginBottom: 10,
            }}
            numberOfLines={2}>
            {this.aboutText()}
          </Text>
          <View style={styles.actionButtonContainer}>
            <TouchableOpacity
              activeOpacity={0.6}
              onPress={this.props.cancelTapped}
              style={StyleSheet.flatten([
                styles.actionButton,
                styles.actionButtonFilter,
              ])}>
              <Text style={styles.actionButtonText}>
                {strings.doneAction.toLocaleUpperCase()}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.6}
              onPress={() => Linking.openURL('https://ChaiOne.com/eula')}
              style={StyleSheet.flatten([
                styles.actionButton,
                styles.actionButtonFilter,
              ])}>
              <Text style={styles.actionButtonText}>
                {strings.eula.toLocaleUpperCase()}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.6}
              onPress={this.contactTapped}
              style={StyleSheet.flatten([
                styles.actionButton,
                styles.actionButtonFilter,
              ])}>
              <Text style={styles.actionButtonText}>
                {strings.contact.toLocaleUpperCase()}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    );
  }
}
