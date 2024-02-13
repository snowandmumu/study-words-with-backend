import React, { useState, useEffect, Fragment } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Anchor, Modal, DatePicker, Select, Menu, ConfigProvider, Result} from 'antd';
import { TransactionOutlined, SmileOutlined, RedditOutlined, SoundOutlined } from '@ant-design/icons';
import { Link } from "react-router-dom";
import _ from 'lodash';
import dayjs from 'dayjs';
import './card.css';
import {letterList} from '../../config';
// import {list1, list2, list3, list4, list5, list6, list7, list8, list9, list10, list11, list12, list13, list14, list15} from './wordlist-es';
import RenderOneWord from './oneWord';
import {getFirstWord, useUpdateEffect} from '../../tools';
import { getWordsAction, updateWordAction } from '../../actions/words';
import request from '../../request/request';

const { RangePicker } = DatePicker;
const options = [
    {label: '未学习', value: 0},
    {label: '已学习', value: 1},
    {label: '复习并通过', value: 2},
    {label: '复习未通过', value: 3},
    {label: '归档', value: 4},
];
const getNavItems = callback => ([
    {
      label: 'Study word',
      key: 'word',
      icon: <TransactionOutlined />,
    },
    {
      label: <Link to='/review'>Go to review</Link>,
      key: 'review',
      icon: <SmileOutlined />,
    },
    {
        label: <Link to='/test'>Go to test</Link>,
        key: 'test',
        icon: <RedditOutlined />,
      },
    {
      label: (
        <span onClick={callback}>Words learned today</span>
      ),
      key: 'count',
      icon: <SoundOutlined />
    },
  ]);

function App() {
    const dispatch = useDispatch();
    const [cardVisible, setCardVisible] = useState(false);
    const [firstWords, setFirstWords] = useState([]);
    const [viewVisible, setViewVisible] = useState(false);
    const [currentWord, setCurrentWord] = useState(localStorage.getItem('currentWord') || null);
    const [audiotEndTime, setAudiotEndTime] = useState((new Date()).getTime());
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);
    const [status, setStatus] = useState([0, 1, 2, 3, 4]);
    const [currentNav, setCurrentNav] = useState('word');

    useEffect(() => {
        setTimeout(() => {
            const scrollElement = document.getElementById('time-line');
            const anchorElement = document.getElementsByClassName("current-time-line")?.[0];
            if (scrollElement && anchorElement) {
                scrollElement.scrollTo({ top: anchorElement.offsetTop + 2, behavior: "smooth" });
            }
        }, 500);
        setTimeout(() => {
            // 获取链接中的初始值
            const search = window.location.search?.substring(1);
            const paramsPairs = search?.split('&');
            for (let i = 0; i < paramsPairs.length; i++) {
                const item = paramsPairs[i];
                const itemPair = item.split('=');
                if (itemPair[0] === 'status') {
                    setStatus([Number(itemPair[1])]);
                }
                if (itemPair[0] === 'startTime') {
                    setStartTime(itemPair[1]);
                }
                if (itemPair[0] === 'endTime') {
                    setEndTime(itemPair[1]);
                }
            }
        }, 500);
        // request.get('/words/getWords', {startTime, endTime, status}).then((res={})=>{
        //     // 此处只接收成功数据，失败数据不返回
        //     console.log(res);
        // }).catch((error)=>{
        //     // catch 可以不要，如果想要捕获异常，就加上去
        //     console.log(error)
        // });

        // request.patch('/words/updateWord', {_id: '65c21c5dab1098df757623d7', text: 'forge', status: 3, updatedAt: 1707368686205}).then((res={})=>{
        //     // 此处只接收成功数据，失败数据不返回
        //     console.log(res);
        // }).catch((error)=>{
        //     // catch 可以不要，如果想要捕获异常，就加上去
        //     console.log(error)
        // });

        // request.post('/words/createWord', {text: 'xxxx'}).then((res={})=>{
        //     // 此处只接收成功数据，失败数据不返回
        //     console.log(res);
        // }).catch((error)=>{
        //     // catch 可以不要，如果想要捕获异常，就加上去
        //     console.log(error)
        // });

        // request.delete('/words/deleteWord', {_id: '65c461cf0b1ae23c024c1d5e'}).then((res={})=>{
        //     // 此处只接收成功数据，失败数据不返回
        //     console.log(res);
        // }).catch((error)=>{
        //     // catch 可以不要，如果想要捕获异常，就加上去
        //     console.log(error)
        // });
    }, []);
  
    useEffect(() => {
        // 加入ignore的原因是保证最终数据返回的顺序和请求的顺序一致，参考：https://juejin.cn/post/7225632029799776312
        let ignore = false;
        request.get('/words/getWords', {startTime, endTime, status}).then((res={})=>{
            if (!ignore) {
                dispatch(getWordsAction(res));
                const firstWords = getFirstWord(res);
                setFirstWords(firstWords);
            }
        }).catch((error)=>{
            console.log(error)
        });
        return () => {
            ignore = true;
        }
    }, [currentWord, startTime, endTime, status]);

    const words = useSelector((state) => {
        return state.words;
    });

    const handleWord = () => {
        const targetWord = _.find(words, info => info.text === currentWord);
        if (targetWord && currentWord) {
            const newData = {...targetWord, updatedAt: (new Date()).getTime()};
            if (newData.status === 0) {
                newData.status = 1;
            }
            // dispatch(updateWord(targetWord._id, newData));
            request.patch('/words/updateWord', newData).then((res={})=>{
                dispatch(updateWordAction(res));
            }).catch((error)=>{
                console.log(error)
            });
        }
        else {
            console.log('不可能走到这里来吧');
        }
    };

    useUpdateEffect(handleWord, [audiotEndTime])
  
    const onClickWord = word => {
        localStorage.setItem('currentWord', word);
        setCardVisible(true);
        setCurrentWord(word);
    }

    const updatAudioEndTime = () => {
        setAudiotEndTime((new Date()).getTime());
    };
  
    const onClickView = () => {
        setViewVisible(true);
    }
    
    const onCloseView = () => {
        setViewVisible(false);
    }

    // 原来所有单词列表都是写在静态文件里面了，现在存入数据库了，因此下面的注释了
    // const list = list1.concat(list2, list3, list4, list5, list6, list7, list8, list9, list10, list11, list12, list13, list14, list15).sort();
    const list = Array.from(new Set(words.map(item => item.text))).sort();
    // 获取今天记过的单词
    const todayWords = words.filter(item => {
        // 获取当前日期
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const day = now.getDate();
        // 获取今天的开始时间
        const startTime = (new Date(year, month, day, 0, 0, 0)).getTime();
        // 获取今天的结束时间
        const endTime = (new Date(year, month, day, 23, 59, 59)).getTime();
        return item.updatedAt >= startTime && item.updatedAt <= endTime;
    });

    const onChangeDate = (date) => {
        const [startTime, endTime] = date;
        const startTime2 = dayjs(startTime).valueOf();
        const endTime2 = dayjs(endTime).valueOf() + 24 * 60 * 60 * 1000 - 1;
        setStartTime(startTime2);
        setEndTime(endTime2);
    }
    const dates = (startTime && endTime) ? [dayjs(Number(startTime)), dayjs(Number(endTime))] : null;

    const onChangeStatus = status => {
        setStatus(status);
    };

    const onClickNav = (e) => {
        if (e.key !== 'count') {
            setCurrentNav(e.key);
        }
    };

    const navItems = getNavItems(onClickView);

    const tipNode = <div className='tip-text'>{`Great, it's ${dayjs().format('YYYY/MM/DD')}, so let's start learning words!`}</div>

    return (
        <Fragment>
            <ConfigProvider theme={{
                components: {
                    Menu: {
                        itemBg: 'none',
                        // horizontalItemSelectedColor: 'orangered',
                        fontSize: 16,
                        iconSize: 18
                    }
                },
                }}
            >
                <div className='nav'>
                    <Menu style={{width: '700px', margin: '0 auto'}} onClick={onClickNav} selectedKeys={[currentNav]} mode="horizontal" items={navItems} />
                </div>
                <div className="App">
                    <div className='opeartor'>
                        <RangePicker onChange={onChangeDate} value={dates} />
                        <Select
                            mode="multiple"
                            placeholder="Please select"
                            value={status}
                            onChange={onChangeStatus}
                            options={options}
                            style={{width: '470px'}}
                        />
                    </div>
                    <div className='App-inner'>
                        <div className='word-content'>
                            {cardVisible
                                ? <RenderOneWord word={currentWord} updatAudioEndTime={updatAudioEndTime} />
                                : (<div className='tip-box'><Result
                                    icon={<SmileOutlined style={{fontSize: '120px'}} />}
                                    title="Cheng Hanqi"
                                    subTitle={tipNode}
                                /></div>)
                            }
                        </div>
                        <div className='time-line' id="time-line">
                            {list.map(word => {
                                let id = null;
                                const index = _.findIndex(firstWords, item => item.word === word);
                                if (index > -1) {
                                    id = firstWords[index].letter;
                                }
                                return (
                                    <div className={`time-line-word-item-container ${word === currentWord ? 'current-time-line' : ''}`} id={id} key={word}>
                                        <span className={`time-line-word-item-dot ${word === currentWord ? 'time-line-word-item-dot-red' : ''}`}></span>
                                        <div className={`time-line-word-item ${word === currentWord ? 'time-line-word-item-red' : ''}`} onClick={_.partial(onClickWord, word)}>{word}</div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className='quick-menu'>
                            <Anchor
                                items={letterList.map(letter => ({
                                    key: letter,
                                    href: `#${letter}`,
                                    title: <div style={{fontSize: '14px', fontWeight: 'bold'}}>{letter}</div>
                                }))}
                            />
                        </div>
                        <Modal title="今日单词情况" open={viewVisible} onOk={onCloseView} onCancel={onCloseView}>
                            <div className="all-words-info">
                                <p>今天学习的单词有<span>{todayWords.length}</span>个:</p>
                                <div>{todayWords && todayWords.map(w => w.text).join(", ")}</div>
                            </div>
                        </Modal>
                    </div>
                </div>
            </ConfigProvider>
        </Fragment>
    );
  };
  
  export default App;