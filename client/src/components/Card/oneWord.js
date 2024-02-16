import React, {PureComponent} from 'react';
import _ from 'lodash';
import {SoundOutlined} from '@ant-design/icons';
import AudioPlayer from '../player';
import examples from './examples_1';

/* eslint-disable */
const hostName = 'http://139.180.129.169';

const defaultState = {
    currentWord: null,
    currentAudio: null,
    ukAudio: null,
    usAudio: null,
    commonInfo: null,
    sense1CommonInfo: null,
    chatGPTExamples: []
};

let audioInstances = [];
let timer = null;

export default class RenderOneWord extends PureComponent {
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

        // // 加载sense2基本信息
        // import(`./wordlist/${word}/list/sense2/senseCommon.js`).then(res => {
        //     this.setState({
        //         sense2CommonInfo: res.default
        //     });
        // }).catch(err => {});

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

        // 加载额外的chatgpt例句
        // 如果key存在则说明有补充例句，每个单词若有补充例句的话有5个补充例句
        if (examples[`${word}_0`]) {
            this.setState({
                chatGPTExamples: [
                    examples[`${word}_0`],
                    examples[`${word}_1`],
                    examples[`${word}_2`],
                    examples[`${word}_3`],
                    examples[`${word}_4`]
                ]
            });
        }
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
        const dicExamples = {};
        const senseExamples = sense1CommonInfo?.wordExamples?.map((item, itemIndex) => {
            dicExamples[`${word}_sense_1_example_${itemIndex}`] = item;
            return `${hostName}/audios/${word}_sense_1_example_${itemIndex}.mp3`;
        });
        const chatGPTExamples = examples[`${word}_0`] ? [
            `${hostName}/audios/${word}_0.mp3`,
            `${hostName}/audios/${word}_1.mp3`,
            `${hostName}/audios/${word}_2.mp3`,
            `${hostName}/audios/${word}_3.mp3`,
            `${hostName}/audios/${word}_4.mp3`,
        ] : [];
        const targetAudios = [
            ukAudio,
            `${hostName}/audios/${word}_sense_1_def.mp3`,
            ...senseExamples,
            ...chatGPTExamples,
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
                    this.props.updatAudioEndTime();
                    this.setState({
                        currentAudio: null
                    });
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

    render() {
        const {
            word,
            times
        } = this.props;
        
        const {
            ukAudio,
            usAudio,
            commonInfo,
            sense1CommonInfo,
            chatGPTExamples,
            currentAudio
        } = this.state;
        return (
            <div className='word-container'>
                <div className='word'>
                    <div className='word-text'>
                        {word}
                        <span style={{fontSize: '14px', color: 'gray'}}>本次已学习{times}个单词</span>
                        <div><SoundOutlined onClick={this.playOneWordAudios} /></div>
                    </div>
                </div>
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
                    {
                        [sense1CommonInfo].map((senseItem, index) => {
                            // const targetImg = index === 0 ? sense1Img : sense2Img;
                            if (senseItem) {
                                return (
                                    <div className={`sense sense${index + 1}`} key={word}>
                                        <div className='sense-info'>
                                            {senseItem?.wordDef &&
                                                (
                                                    <div className={`word-def ${currentAudio === `${hostName}/audios/${word}_sense_1_def.mp3` ? 'current' : ''}`}>
                                                        <span className='def-audio'>
                                                            <AudioPlayer url={`${hostName}/audios/${word}_sense_${index + 1}_def.mp3`} />
                                                        </span>
                                                        {senseItem.wordDef}
                                                    </div>
                                                )
                                            }
                                            <div id="card-container" className='word-example-list'>
                                                {senseItem?.wordExamples.map((example, exampleIndex) => {
                                                    const exampleAudio = `${hostName}/audios/${word}_sense_${index + 1}_example_${exampleIndex}.mp3`;
                                                    return (
                                                        <div
                                                            id={exampleIndex.toString()}
                                                            className={`word-example-item ${currentAudio === exampleAudio ? 'current' : ''}`}
                                                            key={`${word}_example_${exampleIndex}`}
                                                        >
                                                            <div className='word-example-item-left'>
                                                                <img className='img' src={`${hostName}/images/${word}_sense_${index + 1}_example_${exampleIndex}.png`} />
                                                            </div>
                                                            <div className='word-example-item-right'>
                                                                <span className='dic-example-audio'>
                                                                    <AudioPlayer url={exampleAudio} />
                                                                </span>
                                                                {example}
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                                {chatGPTExamples.length > 0 && index === 0 &&
                                                    chatGPTExamples.map((example, exampleIndex) => {
                                                        const audioUrl = `${hostName}/audios/${word}_${exampleIndex}.mp3`
                                                        return (
                                                            <div
                                                                id={`${(exampleIndex + senseItem?.wordExamples?.length).toString()}`}
                                                                className={`word-example-item ${currentAudio === audioUrl ? 'current' : ''}`}
                                                                key={`${word}_audio_${exampleIndex}`}
                                                            >
                                                                <div className='word-example-item-left'>
                                                                    <img className='img' src={`${hostName}/images/${word}_${exampleIndex}.png`} />
                                                                </div>
                                                                <div className='word-example-item-right'>
                                                                    <span className='example-audio'>
                                                                        {audioUrl && <AudioPlayer url={audioUrl} />}
                                                                    </span>
                                                                    {example}
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                            </div>
                                        </div>
                                    </div>
                                );
                            }
                        })
                    }
                </div>
            </div>
        );
    }
}
