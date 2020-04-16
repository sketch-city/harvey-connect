import {StyleSheet} from 'react-native';

export const Colors = {
  green: '#009000',
  maroon: '#800000',
  darkblue: '#000080',
  needText: '#505E65',
  separatorColor: 'rgba(0,0,0,0.1)',

  white: '#FFFFFF',
  red: '#FF5A5F',
  cyan: '#50E3C2',
  blue: '#0080FE',
  black: '#505E65',
  grey: '#A2AEB6',
};

type fontWeightType =
  | '600'
  | '300'
  | '500'
  | '700'
  | 'normal'
  | 'bold'
  | '100'
  | '200'
  | '400'
  | '800'
  | '900';

export const dropShadowStyles = {
  shadowRadius: 1,
  shadowOffset: {width: 0, height: 0.5},
  shadowOpacity: 0.7,
  shadowColor: 'black',
  elevation: 4,
};

export const TitleText = {
  fontSize: 24,
  fontWeight: '600' as fontWeightType,
  color: Colors.black,
};

export const PlainText = {
  fontSize: 18,
  color: Colors.black,
  fontWeight: '300' as fontWeightType,
};

export const ButtonText = {
  fontSize: 26,
  fontWeight: '500' as fontWeightType,
  color: Colors.black,
};

export const SmallButtonText = {
  fontSize: 15,
  fontWeight: '700' as fontWeightType,
  color: Colors.white,
};

export const styles = StyleSheet.create({
  cardSheet: {
    left: 0,
    right: 0,
    bottom: 10,
    flexDirection: 'column',
    justifyContent: 'space-between',
    position: 'absolute',
  },
  cardViewContainer: {
    flex: 1,
    height: 240,
    borderRadius: 50,
  },
  actionButtonContainer: {
    height: 44,
    flexDirection: 'row',
    alignContent: 'space-around',
    justifyContent: 'space-between',
    margin: 10,
    alignItems: 'center',
  },
  actionButton: {
    height: 44,
    flex: 1,
    backgroundColor: 'green',
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 50,
    marginRight: 10,
    marginLeft: 10,
    ...dropShadowStyles,
  },
  actionButtonSpacer: {
    height: 0,
    flex: 1,
    flexDirection: 'row',
    marginRight: 0,
    marginLeft: 0,
  },
  actionButtonIcon: {
    color: '#FFF',
    marginRight: 8,
  },
  actionButtonFilter: {
    backgroundColor: '#FF5A5F',
  },
  actionButtonNeed: {
    backgroundColor: '#0080FE',
  },
  actionButtonText: {
    ...SmallButtonText,
  },
});
