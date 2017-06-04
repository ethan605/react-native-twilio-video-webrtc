import React, { Component } from 'react'
import { requireNativeComponent } from 'react-native'

class TwilioRemotePreview extends Component {
  static propTypes = {

  }

  render() {
    return <TWRemotePreview {...this.props}>{this.props.children}</TWRemotePreview>
  }
}

const TWRemotePreview = requireNativeComponent('TWRemotePreview', TwilioRemotePreview)

module.exports = TwilioRemotePreview
