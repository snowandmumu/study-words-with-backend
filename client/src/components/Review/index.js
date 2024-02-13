import React, { useState, useEffect, Fragment } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from "react-router-dom";
import { DatePicker, Empty, Modal, Button, Menu, ConfigProvider} from 'antd';
import { TransactionOutlined, SmileOutlined, RedditOutlined } from '@ant-design/icons';
import _ from 'lodash';
import './review.css';
import {getWordsAction, updateWordAction} from '../../actions/reviewWords';
import ReviewWord from './reviewCard';
import {useUpdateEffect, getTimePair} from '../../tools';
import request from '../../request/request';

const { RangePicker } = DatePicker;

let count = 0;
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
    // const times = getTodayTimePair();
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);
    const [showEmpty, setShowEmpty] = useState(false);
    const [tipVisible, setTipVisible] = useState(false);
    const [currentWord, setCurrentWord] = useState('');
    const [cannotWords, setCannotWords] = useState([]);
    const [currentNav, setCurrentNav] = useState('review');

    const reviewWords = useSelector((state) => {
        return state.reviewWords;
    });

    const updateCurrentWord = () => {
        if (count < reviewWords.length) {
            const targetWord = reviewWords[count];
            setCurrentWord(targetWord?.text);
            count++;
        }
        else {
            setTipVisible(true);
        }
    }

    useEffect(() => {
        if (startTime && endTime) {
            // dispatch(getWords({startTime, endTime, status: [1, 3]}));
            request.get('/words/getWords', {startTime, endTime, status: [1, 3]}).then((res={})=>{
                console.log(res);
                dispatch(getWordsAction(res));
            }).catch((error)=>{
                console.log(error)
            });
            setTipVisible(false);
        }
    }, [startTime, endTime]);

    useUpdateEffect(updateCurrentWord, [reviewWords]);

    const onChangeDate = (date, str) => {
        const [start, end] = str;
        if (!start || !end) {
            setShowEmpty(true);
        }
        else {
            const {startTime} = getTimePair(start);
            const {endTime} = getTimePair(end);
            setStartTime(startTime);
            setEndTime(endTime);
            setShowEmpty(false);
        }
    }

    const handleCannot = () => {
        updateCurrentWord();
        // 更新单词状态
        const targetWord = _.find(reviewWords, info => info.text === currentWord);
        if (targetWord && currentWord) {
            const newData = {...targetWord, status: 3};
            // dispatch(updateWord(targetWord._id, newData));
            request.patch('/words/updateWord', newData).then((res={})=>{
                dispatch(updateWordAction(res))
            }).catch((error)=>{
                console.log(error)
            });
            setCannotWords([...cannotWords, currentWord])
        }
    }

    const handleCan = () => {
        updateCurrentWord();
        // 更新单词状态
        const targetWord = _.find(reviewWords, info => info.text === currentWord);
        if (targetWord && currentWord) {
            const newData = {...targetWord, status: 2};
            // dispatch(updateWord(targetWord._id, newData));
            request.patch('/words/updateWord', newData).then((res={})=>{
                dispatch(updateWordAction(res))
            }).catch((error)=>{
                console.log(error)
            });
        }
    }

    const handleAgain = () => {
        setTipVisible(false);
        count = 0;
        setCannotWords([]);
        // dispatch(getWords({startTime, endTime, status: [3]}));
        request.get('/words/getWords', {startTime, endTime, status: [3]}).then((res={})=>{
            dispatch(getWordsAction(res));
        }).catch((error)=>{
            console.log(error)
        });
    };

    const handleGotoStudy = () => {
        setTipVisible(false);
    };

    const handleCancel = () => {
        setTipVisible(false);
    };

    const onClickNav = (e) => {
        setCurrentNav(e.key);
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
                        <RangePicker style={{marginBottom: '10px'}} onChange={onChangeDate} />
                        {
                            showEmpty || reviewWords.length === 0
                                ? <div><Empty imageStyle={{height: '150px'}} description="No words" /></div>
                                : <ReviewWord word={currentWord} handleCannot={handleCannot} handleCan={handleCan} />
                        }
                    </div>
                    <Modal
                        title="恭喜你完成本轮复习哦"
                        open={tipVisible}
                        footer={[
                            <Button key="back" onClick={handleCancel}>
                            取消
                            </Button>,
                            <Button key="submit" type="primary" onClick={handleAgain}>
                            再复习一次
                            </Button>,
                            <Button
                            key="link"
                            type="link"
                            onClick={handleGotoStudy}
                            >
                            <Link to={`/?startTime=${startTime}&endTime=${endTime}&status=3`}>再去学一次</Link>
                            </Button>,
                        ]}
                    >
                        <div className="all-words-info">
                            <div>
                                <p>本轮复习的单词有：</p>
                                <p>{reviewWords.map(w => w.text).join(',')}</p>
                            </div>
                            <div>
                                <p>本轮复习结束，其中不会的单词有：</p>
                                <p>{cannotWords.join(',')}</p>
                            </div>
                        </div>
                    </Modal>
                </div>
            </ConfigProvider>
        </Fragment>
    );
  };
  
  export default App;