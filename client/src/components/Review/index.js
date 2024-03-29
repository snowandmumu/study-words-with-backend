import React, { useState, useEffect, Fragment } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from "react-router-dom";
import { Empty, Modal, Button, Menu, ConfigProvider} from 'antd';
import { TransactionOutlined, SmileOutlined, RedditOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import _ from 'lodash';
import './review.css';
import {getWordsAction, updateWordAction} from '../../actions/reviewWords';
import ReviewWord from './reviewCard';
import {useUpdateEffect} from '../../tools';
import request from '../../request/request';

let times = 0;
let times2 = 0;
const getNavItems = () => ([
    {
      label: <Link to='/'>Study word</Link>,
      key: 'word',
      icon: <TransactionOutlined />,
    },
    {
      label: 'Go to review',
      key: 'review',
      icon: <SmileOutlined />,
    },
    {
        label: <Link to='/test'>Go to test</Link>,
        key: 'test',
        icon: <RedditOutlined />,
    }
  ]);

function App() {
    const dispatch = useDispatch();
    const [tipVisible, setTipVisible] = useState(false);
    const [currentWord, setCurrentWord] = useState('');
    const [currentNav, setCurrentNav] = useState('review');
    const [preDisabled, setPreDisabled] = useState(false);
    const [nextDisabled, setNextDisabled] = useState(false);

    const updateCurrentWord = () => {
        if (times < reviewWords.length) {
            const targetWord = reviewWords[times];
            setCurrentWord(targetWord?.text);
            times++;
            setPreDisabled(false);
        }
        else {
            setTipVisible(true);
            setNextDisabled(true);
        }
    }

    const updateCurrentWord2 = () => {
        if (times > 0 && currentWord !== reviewWords?.[0]?.text) {
            const targetWord = reviewWords[times];
            setCurrentWord(targetWord?.text);
            times--;
        }
        else if (times === 0) {
            const targetWord = reviewWords[times];
            setCurrentWord(targetWord?.text);
        }
        else {
            setPreDisabled(true);
        }
    }

    useEffect(() => {
        request.get('/api/getWords', {}).then((res={})=>{
            const wordsWithPriority = _.sortBy(res, word => {
                const {count, updatedAt} = word;
                const now = new Date().getTime();
                const priority = (now - updatedAt) / Math.pow(3, count);
                return -priority;
            });
            dispatch(getWordsAction(wordsWithPriority));
        }).catch((error)=>{
            console.log(error)
        });
        setTipVisible(false);
    }, []);

    const reviewWords = useSelector((state) => {
        return state.reviewWords;
    });

    useUpdateEffect(updateCurrentWord, [reviewWords]);

    const handleCan = () => {
        // 更新单词状态
        const targetWord = _.find(reviewWords, info => info.text === currentWord);
        if (targetWord && currentWord) {
            const newData = {...targetWord, count: targetWord.count + 1, updatedAt: new Date().getTime()};
            request.patch('/api/updateWord', newData).then((res={})=>{
                // dispatch(updateWordAction(res));
                times2++;
            }).catch((error)=>{
                console.log(error)
            });
        }
    }

    const handleAgain = () => {
        setTipVisible(false);
        times = 0;
        request.get('/api/getWords', {}).then((res={})=>{
            const wordsWithPriority = _.sortBy(res, word => {
                const {count, updatedAt} = word;
                const now = new Date().getTime();
                const priority = (now - updatedAt) / Math.pow(3, count);
                return -priority;
            });
            dispatch(getWordsAction(wordsWithPriority));
        }).catch((error)=>{
            console.log(error)
        });
    };

    const handleCancel = () => {
        setTipVisible(false);
    };

    const onClickNav = (e) => {
        setCurrentNav(e.key);
    };

    const onHandlePre = () => {
        updateCurrentWord2();
    };

    const onHandleNext = () => {
        updateCurrentWord();
    };

    const navItems = getNavItems();

    return (
        <Fragment>
            <ConfigProvider theme={{
                components: {
                    Menu: {
                        itemBg: 'none',
                        fontSize: 16,
                        iconSize: 18
                    }
                },
                }}
            >
                <div className='nav'>
                    <Menu style={{width: '700px', margin: '0 auto'}} onClick={onClickNav} selectedKeys={[currentNav]} mode="horizontal" items={navItems} />
                </div>
                <div className="review-container">
                    <div className='review-content'>
                        {
                            reviewWords.length === 0
                                ? <div><Empty imageStyle={{height: '150px'}} description="No words" /></div>
                                : <ReviewWord times={times2} word={currentWord} handleCan={handleCan} />
                        }
                    </div>
                    <div className={`review-pre-arrow ${currentWord === reviewWords?.[0]?.text ? 'review-pre-arrow-disabled' : ''}`} onClick={onHandlePre}><LeftOutlined /></div>
                    <div className={`review-next-arrow ${nextDisabled ? 'review-next-arrow-disabled' : ''}`} onClick={onHandleNext}><RightOutlined /></div>
                    <Modal
                        title="恭喜你完成本轮复习哦"
                        open={tipVisible}
                        footer={[
                            <Button key="back" onClick={handleCancel}>
                            取消
                            </Button>,
                            <Button key="submit" type="primary" onClick={handleAgain}>
                            再复习一次
                            </Button>
                        ]}
                    >
                        <div className="all-words-info">
                            <div>
                                <p>本轮复习的单词有：</p>
                                <p>{reviewWords.map(w => w.text).join(',')}</p>
                            </div>
                        </div>
                    </Modal>
                </div>
            </ConfigProvider>
        </Fragment>
    );
  };
  
  export default App;