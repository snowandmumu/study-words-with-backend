import React, { Component } from 'react';
import {SoundOutlined} from '@ant-design/icons';

export default class AudioPlayer extends Component {
  constructor(props) {
    super(props);
    this.audioRef = React.createRef();
  }

  playAudio = () => {
    this.audioRef.current.play();
  }

  render() {
    return (
      <div>
        <audio ref={this.audioRef}>
          <source src={this.props.url} type="audio/mpeg" />
        </audio>
        <SoundOutlined onClick={this.playAudio} />
      </div>
    );
  }
}
