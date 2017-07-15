/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import { AppRegistry } from 'react-native';

import TwillioConnector from './TwillioConnector';

export default class Example extends Component {
  render() {
    return (
      <TwillioConnector />
    );
  }
}

AppRegistry.registerComponent('Example', () => Example);
