import {useEffect, useRef } from 'react';
import _ from 'lodash';
import {list1, list2, list3, list4, list5, list6, list7, list8, list9, list10, list11, list12, list13, list14, list15} from './components/Card/wordlist-es';
import {letterList} from './config';

// 获取所有单词的字典例句
export const getDicExamples = () => {
    let k = 0;
    const list = list1.concat(
        list2, 
        list3, 
        list4, 
        list5, 
        list6, 
        list7, 
        list8, 
        list9, 
        list10, 
        list11, 
        list12, 
        list13, 
        list14, 
        list15
        ).sort();
    const uniqueArr = Array.from(new Set(list));
    const obj = {};
    for (let i = 0; i < uniqueArr.length; i++) {
        const word = uniqueArr[i];
        // 加载sense1基本信息
        import(`./wordlist/${word}/list/sense1/senseCommon.js`).then(res => {
            const senseExamples = res.default?.wordExamples?.map((item, itemIndex) => {
                obj[`${word}_sense_1_example_${itemIndex}`] = item;
            });
            k++;
        }).catch(err => {});
    }
    setInterval(() => {
        if (k === uniqueArr.length) {
            console.log(JSON.stringify(obj));
        }
    }, 30000)
}

export const getFirstWord = list => {
    const firstWords = [];
    const words = list.map(i => i.text).sort();
    for (let i = 0; i < letterList.length; i++) {
        const wordIndex = _.findIndex(words, item => {
            return _.startsWith(item, letterList[i].toLocaleLowerCase());
        });
        if (wordIndex > -1) {
            firstWords.push({
                letter: letterList[i],
                word: words[wordIndex]
            });
        }
    }
    return firstWords;
};

// 自定义一个初始不更新的hook
export const useUpdateEffect = (fn, inputs) => {
    const didMountRef = useRef(false);
    useEffect(() => {
        if (didMountRef.current) {
            fn();
        }
        else {
            didMountRef.current = true;
        }
    }, inputs);
}

// 获取今天的起始时间
export const getTodayTimePair = () => {
    // 获取当前日期
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const day = now.getDate();
    // 获取今天的开始时间
    const startTime = (new Date(year, month, day, 0, 0, 0)).getTime();
    // 获取今天的结束时间
    const endTime = (new Date(year, month, day, 23, 59, 59)).getTime();
    return {startTime, endTime};
};

// 获取某一天的起始时间
export const getTimePair = dayStr => {
    const list = dayStr.split('-');
    const year = list[0];
    const month = Number(list[1]) - 1;
    const day = Number(list[2]);
    // 获取开始时间
    const startTime = (new Date(year, month, day, 0, 0, 0)).getTime();
    // 获取结束时间
    const endTime = (new Date(year, month, day, 23, 59, 59)).getTime();
    return {startTime, endTime};
};
