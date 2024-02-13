import React, {PureComponent, Fragment} from 'react';
import _ from 'lodash';
import {Skeleton, Button} from 'antd';
import AudioPlayer from '../player';
import examples from '../Card/examples_1';

/* eslint-disable */
const hostName = 'http://139.180.129.169';

const defaultState = {
    currentWord: null,
    currentAudio: null,
    ukAudio: null,
    usAudio: null,
    commonInfo: null,
    sense1CommonInfo: null,
    showWordInfo: false
};

let audioInstances = [];
let timer = null;

export default class ReviewWord extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            ...defaultState,
            currentWord: props.word
        };
    }

    resetState = () => {
        this.setState({...defaultState})
    }

    requireInfo = (w) => {
        const word = w || this.props.word;
        // 加载基本信息
        import(`../../wordlist/${word}/common.js`).then(res => {
            this.setState({
                commonInfo: res.default
            });
        }).catch(err => {});

        // 加载sense1基本信息
        import(`../../wordlist/${word}/list/sense1/senseCommon.js`).then(res => {
            this.setState({
                sense1CommonInfo: res.default
            });
        }).catch(err => {});

        // 加载英式读音音频
        import(`../../wordlist/${word}/audios/uk/${word}.mp3`).then(res => {
            this.setState({
                ukAudio: res.default
            });
            this.audio = new Audio(res.default);
        }).catch(err => {});
        // 加载美式读音音频
        import(`../../wordlist/${word}/audios/us/${word}.mp3`).then(res => {
            this.setState({
                usAudio: res.default
            });
        }).catch(err => {});
    }

    componentDidMount() {
        this.requireInfo();
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.word !== prevState.currentWord) {
            clearTimeout(timer);
            audioInstances?.[0]?.pause();
            audioInstances = [];
            return {...defaultState, currentWord: nextProps.word};
        }
        return null;
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.word !== this.props.word) {
            this.requireInfo(this.props.word);
        }
    }

    getAvailableAudios = () => {
        const {word} = this.props;
        const {
            ukAudio,
            sense1CommonInfo
        } = this.state;

        const exampleAudio = sense1CommonInfo?.wordExamples?.length > 0
            ? `${hostName}/audios/${word}_sense_1_example_0.mp3`
            : (examples[`${word}_0`] ? `${hostName}/audios/${word}_0.mp3` : '');

        const targetAudios = [
            ukAudio,
            `${hostName}/audios/${word}_sense_1_def.mp3`,
            exampleAudio
        ].filter(audio => !!audio);
        return targetAudios;
    }

    playOneWordAudios = () => {
        audioInstances?.[0]?.pause();
        audioInstances = [];
        const list = this.getAvailableAudios();
        const scrollElement = document.getElementById('card-container');    // 对应id的滚动容器
        for (let i = 0; i < list.length; i++) {
            const audio = new Audio(list[i]);
            audio.onended = () => {
                audioInstances.shift()
                if(audioInstances.length >= 1){
                  timer = setTimeout(() => {audioInstances?.[0]?.play();}, 1500);
                  let currentAudio = audioInstances[0].src;
                  if (audioInstances[0].src.indexOf('static') > -1) {
                    currentAudio = audioInstances[0].src.replace(window.location.origin, '');
                  }
                  this.setState({
                        currentAudio
                  }, () => {
                    const index = list.indexOf(currentAudio);
                    if (index > 1) {
                        const anchorElement = document.getElementById((index - 2).toString());  // 须要定位看到的锚点元素
                        if (scrollElement && anchorElement) {
                            scrollElement.scrollTo({ top: anchorElement.offsetTop - 12, behavior: "smooth" });
                        }
                    }
                  });
                }
                else {
                    this.setState({
                        currentAudio: null
                    });
                    this.props.handleCannot();
                }
            };
            audioInstances.push(audio);
        }
        if(audioInstances && audioInstances.length >= 1 && audioInstances[0].paused){
            //没有播放 需要播放
            audioInstances[0].play();
            let currentAudio = audioInstances[0].src;
            if (audioInstances[0].src.indexOf('static') > -1) {
                currentAudio = audioInstances[0].src.replace(window.location.origin, '');
            }
            this.setState({
                currentAudio
            });
        }
    }

    handleCannot = () => {
        this.setState({showWordInfo: true});
        this.playOneWordAudios();
    };

    handleCan = () => {
        this.props.handleCan();
    };

    render() {
        const {
            word
        } = this.props;
        const {
            ukAudio,
            usAudio,
            commonInfo,
            sense1CommonInfo,
            currentAudio,
            showWordInfo
        } = this.state;

        let firstExample = sense1CommonInfo?.wordExamples?.[0];
        let firstExampleAudio = '';
        let firstExampleImage = '';
        let firstExampleText = '';
        if (firstExample) {
            firstExampleAudio = `${hostName}/audios/${word}_sense_1_example_0.mp3`;
            firstExampleImage = `${hostName}/images/${word}_sense_1_example_0.png`;
            firstExampleText = firstExample;
        }
        else {
            firstExampleAudio = examples[`${word}_0`] ? `${hostName}/audios/${word}_0.mp3` : '';
            firstExampleImage = examples[`${word}_0`] ? `${hostName}/images/${word}_0.png` : '';
            firstExampleText = examples[`${word}_0`];
        }

        return (
            <div className='review-word-info'>
                <div className='review-word'>
                    <div className='review-word-text'>
                        {word}
                    </div>
                </div>
                {
                    showWordInfo
                        ? (
                            <Fragment>
                                <div className='class-and-level'>
                                    {commonInfo?.wordClass && <div className='word-class'>{commonInfo.wordClass}</div>}
                                    {sense1CommonInfo?.wordLevel && <span className='word-level'>{sense1CommonInfo.wordLevel}</span>}
                                </div>
                                <div className='word-audio-and-sound-mark'>
                                    {
                                        ukAudio &&
                                            <div className='word-sound uk'>
                                                <span className={`word-sound-type ${currentAudio === ukAudio ? 'current' : ''}`}>UK</span>
                                                <AudioPlayer url={ukAudio} />
                                                {commonInfo?.soundmarks?.uk && <div className='sound-mark sound-mark-uk'>{commonInfo?.soundmarks?.uk}</div>}
                                            </div>
                                    }
                                    {
                                        usAudio &&
                                            <div className='word-sound us'>
                                                <span className='word-sound-type'>US</span>
                                                <AudioPlayer url={usAudio} />
                                                {commonInfo?.soundmarks?.us && <div className='sound-mark sound-mark-us'>{commonInfo?.soundmarks?.us}</div>}
                                            </div>
                                    }
                                </div>
                                <div className='word-sense-container'>
                                    <div className='sense sense1' key={word}>
                                        <div className='sense-info'>
                                            {sense1CommonInfo?.wordDef &&
                                                (
                                                    <div className={`word-def ${currentAudio === `${hostName}/audios/${word}_sense_1_def.mp3` ? 'current' : ''}`}>
                                                        <span className='def-audio'>
                                                            <AudioPlayer url={`${hostName}/audios/${word}_sense_1_def.mp3`} />
                                                        </span>
                                                        {sense1CommonInfo.wordDef}
                                                    </div>
                                                )
                                            }
                                            <div id="card-container" className='word-example-list'>
                                                <div className={`word-example-item ${currentAudio === firstExampleAudio ? 'current' : ''}`}>
                                                    <div className='word-example-item-left'>
                                                        <img className='img' src={firstExampleImage} />
                                                    </div>
                                                    <div className='word-example-item-right'>
                                                        <span className='dic-example-audio'>
                                                            <AudioPlayer url={firstExampleAudio} />
                                                        </span>
                                                        {firstExampleText}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Fragment>
                        )
                        : <Skeleton active />
                }
                {
                    !showWordInfo && (
                        <div className='response'>
                            <div className='btn-box'><Button style={{ width: '100%' }} type="primary" onClick={this.handleCan}>我会了</Button></div>
                            <div className='btn-box'><Button style={{ width: '100%' }} type="primary" danger onClick={this.handleCannot}>我不会</Button></div>
                        </div>
                    )
                }
            </div>
        );
    }
}
