import React, {PureComponent, Fragment} from 'react';
import {Button} from 'antd';
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
    targetInfo: {}
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
        if (word) {
            Promise.all([
                import(`../../wordlist/${word}/common.js`),
                import(`../../wordlist/${word}/list/sense1/senseCommon.js`),
                import(`../../wordlist/${word}/audios/uk/${word}.mp3`),
                import(`../../wordlist/${word}/audios/us/${word}.mp3`)
            ])
            .then(([module1, module2, module3, module4]) => {
                
                const dictExamplesAudios = [];
                const dictExamplesImgs = [];
                const dictExamplesTexts = [];
                if (module2.default?.wordExamples?.length > 0) {
                    for (let i = 0; i < module2.default?.wordExamples?.length; i++) {
                        dictExamplesAudios.push(`${hostName}/audios/${word}_sense_1_example_${i}.mp3`);
                        dictExamplesImgs.push(`${hostName}/images/${word}_sense_1_example_${i}.png`);
                        dictExamplesTexts.push(module2.default?.wordExamples?.[i]);
                    }
                }
                const chatGptExamplesAudios = [];
                const chatGptExamplesImgs = [];
                const chatGptExamplesTexts = [];
                if (examples[`${word}_0`]) {
                    for (let j = 0; j < 5; j++) {
                        chatGptExamplesAudios.push(`${hostName}/audios/${word}_${j}.mp3`);
                        chatGptExamplesImgs.push(`${hostName}/images/${word}_${j}.png`);
                        chatGptExamplesTexts.push(examples[`${word}_${j}`]);
                    }
                }
                const allExamplesAudios = [...dictExamplesAudios, ...chatGptExamplesAudios];
                const allExamplesImgs = [...dictExamplesImgs, ...chatGptExamplesImgs];
                const allExamplesTexts = [...dictExamplesTexts, ...chatGptExamplesTexts];
                const targetIndex = Math.floor(Math.random() * allExamplesAudios?.length);

                this.setState({
                    commonInfo: module1.default,
                    sense1CommonInfo: module2.default,
                    ukAudio: module3.default,
                    usAudio: module4.default,
                    targetInfo: {
                        audio: allExamplesAudios[targetIndex],
                        image: allExamplesImgs[targetIndex],
                        text: allExamplesTexts[targetIndex]
                    }
                });
                setTimeout(() => {this.playOneWordAudios();}, 500);
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
            targetInfo
        } = this.state;

        const targetAudios = [
            ukAudio,
            `${hostName}/audios/${word}_sense_1_def.mp3`,
            targetInfo.audio
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
            targetInfo
        } = this.state;

        return (
            <div className='review-word-info'>
                <div className='review-word'>
                    <div className='review-word-text'>
                        {word}
                    </div>
                </div>
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
                                <div id="card-container" className='review-word-example-list'>
                                    <div className={`word-example-item ${currentAudio === targetInfo.audio ? 'current' : ''}`}>
                                        <div className='word-example-item-left'>
                                            <img className='img' src={targetInfo.image} />
                                        </div>
                                        <div className='word-example-item-right'>
                                            <span className='dic-example-audio'>
                                                <AudioPlayer url={targetInfo.audio} />
                                            </span>
                                            {targetInfo.text}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Fragment>
                <div className='response'>
                    <div className='btn-box'><Button style={{ width: '100%' }} size='large' type="primary" onClick={this.handleCan}>复习完成</Button></div>
                </div>
            </div>
        );
    }
}
