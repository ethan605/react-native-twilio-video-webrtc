import React, { Component } from 'react'
import { requireNativeComponent } from 'react-native'

class TwilioVideoPreview extends Component {
  static propTypes = {
  }
  
  render() {
    return <TWVideoPreview {...this.props}>{this.props.children}</TWVideoPreview>
  }
}


const TWVideoPreview = requireNativeComponent('TWVideoPreview', TwilioVideoPreview)

module.exports = TwilioVideoPreview
