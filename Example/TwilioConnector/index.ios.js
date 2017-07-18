import React from 'react';
import { Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import _ from 'lodash';

import {
  TwilioVideo,
  TwilioVideoLocalView,
  TwilioVideoParticipantView,
} from 'react-native-twilio-video-webrtc';

const CONNECT_STATUSES = {
  CONNECTED: 'connected',
  CONNECTING: 'connecting',
  DISCONNECTED: 'disconnected',
};

const { accessToken: { demoUser1, demoUser2 }, roomName } = require('./credentials.json');

/* eslint-disable no-console */

export default class TwilioConnector extends React.PureComponent {
  state = {
    roomName,
    accessToken: demoUser1,
    isAudioEnabled: true,
    status: CONNECT_STATUSES.DISCONNECTED,
    videoTracks: {},
  }

  onConnect = () => {
    const { accessToken, roomName } = this.state;
    this.twilioConnector.connect({ accessToken, roomName });
    this.setState({ status: CONNECT_STATUSES.CONNECTING });
  };

  onDisconnect = () => this.twilioConnector.disconnect();

  onFlipCamera = () => this.twilioConnector.flipCamera();

  onMute = async () => {
    try {
      const { isAudioEnabled } = this.state;
      const isEnabled = await this.twilioConnector.setLocalAudioEnabled(!isAudioEnabled);
      this.setState({ isAudioEnabled: isEnabled });
    } catch (error) {
      console.warn(error);
    }
  };

  onParticipantAddedVideoTrack = ({ participant, track }) => {
    console.log('onParticipantAddedVideoTrack', participant, track);

    const { videoTracks: oldTracks } = this.state;
    const { trackId } = track;
    const videoTracks = { ...oldTracks, [trackId]: { ...participant, ...track } };
    this.setState({ videoTracks });
  }

  onParticipantRemovedVideoTrack = ({ participant, track }) => {
    console.log('onParticipantRemovedVideoTrack', participant, track);

    const { videoTracks: oldTracks } = this.state;
    const { trackId } = track;
    const videoTracks = _.omit(oldTracks, [trackId]);

    this.setState({ videoTracks });
  }

  onRoomDidConnect = () => this.setState({ status: CONNECT_STATUSES.CONNECTED });

  onRoomDidDisconnect = ({ error }) => {
    console.log('ERROR', error);
    this.setState({ status: CONNECT_STATUSES.DISCONNECTED });
  }

  onRoomDidFailToConnect = error => {
    console.log('ERROR', error);
    this.setState({ status: CONNECT_STATUSES.DISCONNECTED });
  }

  renderDisconnectedScreen = () => {
    const { accessToken, roomName } = this.state;

    return (
      <View>
        <Text style={styles.welcome}>{'React Native Twilio Video'}</Text>
        <TextInput
          autoCapitalize="none"
          onChangeText={text => this.setState({ roomName: text })}
          style={styles.input}
          value={roomName}
        />
        <TextInput
          autoCapitalize="none"
          onChangeText={text => this.setState({ accessToken: text })}
          style={styles.input}
          value={accessToken}
        />
        <Button onPress={this.onConnect} style={styles.button} title="Connect" />
      </View>
    );
  };

  renderCallScreen = () => {
    const { isAudioEnabled, status } = this.state;
    const audioStatus = isAudioEnabled ? 'Mute' : 'Unmute';

    console.log(status);

    return (
      <View style={styles.callContainer}>
        {status === CONNECT_STATUSES.CONNECTED && this.renderRemoteGrid()}
        <View style={styles.optionsContainer}>
          <TouchableOpacity onPress={this.onDisconnect} style={styles.optionButton}>
            <Text style={styles.buttonText}>{'End'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={this.onMute} style={styles.optionButton}>
            <Text style={styles.buttonText}>{audioStatus}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={this.onFlipCamera} style={styles.optionButton}>
            <Text style={styles.buttonText}>{'Flip'}</Text>
          </TouchableOpacity>
          <TwilioVideoLocalView enabled style={styles.localVideo} />
        </View>
      </View>
    );
  };

  renderRemoteGrid = () => {
    const { videoTracks } = this.state;

    return (
      <View style={styles.remoteGrid}>
        {
          _.map(videoTracks, (trackData, videoTrackId) => {
            const { identity: participantIdentity } = trackData;
            const trackIdentifier = { participantIdentity, videoTrackId };

            return (
              <TwilioVideoParticipantView
                key={`video_track_${videoTrackId}`}
                style={styles.remoteVideo}
                trackIdentifier={trackIdentifier}
              />
            );
          })
        }
      </View>
    );
  };

  render() {
    const { status } = this.state;

    const { CONNECTED, CONNECTING, DISCONNECTED } = CONNECT_STATUSES;

    return (
      <View style={styles.container}>
        {status === DISCONNECTED && this.renderDisconnectedScreen()}
        {status === CONNECTED || status === CONNECTING && this.renderCallScreen()}
          
        <TwilioVideo
          onParticipantAddedVideoTrack={this.onParticipantAddedVideoTrack}
          onParticipantRemovedVideoTrack={this.onParticipantRemovedVideoTrack}
          onRoomDidConnect={this.onRoomDidConnect}
          onRoomDidDisconnect={this.onRoomDidDisconnect}
          onRoomDidFailToConnect={this.onRoomDidFailToConnect}
          ref={ref => this.twilioConnector = ref}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
  },
  callContainer: {
    bottom: 0,
    flex: 1,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  welcome: {
    fontSize: 30,
    paddingTop: 40,
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    height: 50,
    marginLeft: 70,
    marginRight: 70,
    marginTop: 50,
    textAlign: 'center',
  },
  button: {
    marginTop: 100,
  },
  buttonText: {
    fontSize: 12,
  },
  localVideo: {
    bottom: 10,
    flex: 1,
    height: 250,
    position: 'absolute',
    right: 10,
    width: 150,
  },
  remoteGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  remoteVideo: {
    backgroundColor: 'cyan',
    height: 200,
    marginLeft: 10,
    marginRight: 10,
    marginTop: 20,
    width: 200,
  },
  optionsContainer: {
    alignItems: 'center',
    backgroundColor: 'blue',
    bottom: 0,
    flexDirection: 'row',
    height: 100,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  optionButton: {
    alignItems: 'center',
    backgroundColor: 'grey',
    borderRadius: 100 / 2,
    height: 60,
    justifyContent: 'center',
    marginLeft: 10,
    marginRight: 10,
    width: 60,
  },
});
