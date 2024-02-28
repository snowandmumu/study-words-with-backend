import React, { useState, useEffect, Fragment } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from "react-router-dom";
import { Modal, Button, Menu, ConfigProvider, Radio, Space} from 'antd';
import { TransactionOutlined, SmileOutlined, RedditOutlined, SoundOutlined } from '@ant-design/icons';
import _ from 'lodash';
import './test.css';
import {getWordsAction, updateWordAction} from '../../actions/testWords';
import request from '../../request/request';

const hostName = 'http://139.180.129.169';

let times = 0;
const getNavItems = () => ([
    {
      label: <Link to='/'>Study word</Link>,
      key: 'word',
      icon: <TransactionOutlined />,
    },
    {
      label: <Link to='/review'>Go to review</Link>,
      key: 'review',
      icon: <SmileOutlined />,
    },
    {
        label: 'Go to test',
        key: 'test',
        icon: <RedditOutlined />,
    }
  ]);

function App() {
    const dispatch = useDispatch();
    const [currentNav, setCurrentNav] = useState('test');
    const [currentWord, setCurrentWord] = useState(null);
    const [testWords, setTestWords] = useState([]);
    const [currentValue, setCurrentValue] = useState(null);
    const [result, setResult] = useState(null);
    const [currentWordDef, setCurrentWordDef] = useState('');
    const [optionWords, setOptionWords] = useState([]);
    const [currentAudio, setCurrentAudio] = useState(null);
    const [correctWords, setCorrectWords] = useState([]);
    const [errorWords, setErrorWords] = useState([]);
    const [tipVisible, setTipVisible] = useState(false);

    useEffect(() => {
        request.get('/api/getWords', {count: JSON.stringify({$gt: 0})}).then((res={})=>{
            const wordsWithPriority = _.sortBy(res, word => {
                const {testCount, updatedAt} = word;
                const now = new Date().getTime();
                const priority = (now - updatedAt) / Math.pow(3, testCount);
                return -priority;
            });
            dispatch(getWordsAction(wordsWithPriority));
            // 设置测试的目标单词
            const testWords = wordsWithPriority.map(i => i.text);

            setTestWords(testWords);
            // 设置测试的第一个单词
            if (testWords.length > 0) {
                const currentWord = testWords[0];
                setCurrentWord(currentWord);
            }
        }).catch((error)=>{
            console.log(error)
        });
    }, []);

    const allWords = useSelector((state) => {
        return state.testWords;
    });

    useEffect(() => {
        // 加载sense1基本信息
        if (currentWord) {
            import(`../../wordlist/${currentWord}/list/sense1/senseCommon.js`).then(res => {
                const def = res.default.wordDef;
                setCurrentWordDef(def);
            }).catch(err => {});

            const randomWords = _.sampleSize(allWords.map(item => item.text), 3);
            const optionWords = _.shuffle(randomWords.concat([currentWord]));
            setOptionWords(optionWords);
        }
    }, [currentWord])

    const navItems = getNavItems();

    const onClickNav = (e) => {
        setCurrentNav(e.key);
    };
    
    const onChangeOptions = e => {
        const value = e.target.value;
        setCurrentValue(e.target.value);
        if (currentAudio) {
            currentAudio.pause();
        }
        if (value === currentWord) {
            setResult('Y');
            setCorrectWords([...correctWords, currentWord]);
        }
        else {
            setResult('N');
            setErrorWords([...errorWords, currentWord]);
        }

        const oldData = _.find(allWords, i => i.text === currentWord);
        const newData = {...oldData};
        if (value === currentWord) {
            newData.testCount = newData.testCount + 1;
        }
        else {
            newData.testCount = 0;
        }
        request.patch('/api/updateWord', newData).then((res={})=>{
            // dispatch(updateWordAction(res))
        }).catch((error)=>{
            console.log(error)
        });

        if (times < testWords.length - 1) {
            times++;
            setTimeout(() => {
                setCurrentWord(testWords[times]);
                setResult(null);
            }, 800);
        }
        else {
            setTipVisible(true);
        }
    }

    const handleCancel = () => {
        setTipVisible(false);
    };

    const playOneWordAudios = () => {
        const audio = new Audio(`${hostName}/audios/${currentWord}_sense_1_def.mp3`);
        audio.play();
        setCurrentAudio(audio);
    };

    const resultClass = result ? (result === 'Y' ? 'test-result-green' : 'test-result-red') : ''; 

    return (
        <Fragment>
            <ConfigProvider theme={{
                components: {
                    Menu: {
                        itemBg: 'none',
                        fontSize: 16,
                        iconSize: 18
                    },
                    Radio: {
                        fontSize: 18,
                        lineHeight: 2
                    },
                },
                }}
            >
                <div className='nav'>
                    <Menu style={{width: '700px', margin: '0 auto'}} onClick={onClickNav} selectedKeys={[currentNav]} mode="horizontal" items={navItems} />
                </div>
                <div className='test-container'>
                    <div className='test-def'>
                        <div className='test-def-audio'><SoundOutlined onClick={playOneWordAudios} /></div>
                        {currentWordDef}
                    </div>
                    <div className={`test-words-options ${resultClass}`}>
                        <Radio.Group onChange={onChangeOptions} value={currentValue} size='large'>
                            <Space direction="vertical">
                                {optionWords.map(word => <Radio value={word}>{word}</Radio>)}
                            </Space>
                        </Radio.Group>
                    </div>
                    <div className='test-count'>本次已测试{times}个单词</div>
                </div>
                {tipVisible && <Modal
                    title="程瀚奇，恭喜你完成本轮测试，你的测试结果如下："
                    open={tipVisible}
                    footer={[
                        <Button key="back" onClick={handleCancel}>关闭</Button>
                    ]}
                >
                    <div className="all-words-info">
                        <div>
                            <p>测试通过的单词有：</p>
                            <p>{correctWords.join(',')}</p>
                        </div>
                        <div>
                            <p style={{color: 'red'}}>测试未通过的单词有：</p>
                            <p>{errorWords.join(',')}</p>
                        </div>
                    </div>
                    </Modal>
                }
            </ConfigProvider>
        </Fragment>
    );
  };
  
  export default App;