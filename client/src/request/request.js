import { Message, Loading } from 'element-ui';
import instance from './interceptor'

/**
 * 核心函数，可通过它处理一切请求数据，并做横向扩展
 * @param {url} 请求地址
 * @param {params} 请求参数
 * @param {options} 请求配置，针对当前本次请求；
 * @param loading 是否显示loading
 * @param mock 本次是否请求mock而非线上
 * @param error 本次是否显示错误
 */
function request(url, params, options = {loading:true, mock:false, error:true}, method){
    let loadingInstance;
    // 请求前loading
    if (options.loading) {
        loadingInstance = Loading.service();
    }
    return new Promise((resolve,reject)=>{
        let data = {}
        // get请求使用params字段
        if (method === 'get' || method === 'delete') {
            data = {params};
        }
        // post请求使用data字段
        if (method === 'post' || method === 'patch') {
            data = {data: params};
        }
        // 通过mock平台可对局部接口进行mock设置
        if (options.mock) {
            url='http://www.mock.com/mock/xxxx/api';
        }

        instance({
            url,
            method,
            ...data
        }).then((res)=>{
            // 此处作用很大，可以扩展很多功能。
            // 比如对接多个后台，数据结构不一致，可做接口适配器
            // 也可对返回日期/金额/数字等统一做集中处理
            if (res.code === 0){
                resolve(res.data);
            }
            else{
                // 通过配置可关闭错误提示
                if (options.error) {
                    Message.error(res.message);
                }
                reject(res);
            }
        }).catch((error) => {
            Message.error(error.message);
        }).finally(() => {
            loadingInstance.close();
        })
    })
}
// 封装GET请求
function get(url, params, options) {
    return request(url, params, options, 'get');
}
// 封装POST请求
function post(url, params, options) {
    return request(url, params, options, 'post')
}
// 封装DELETE请求
function del(url, params, options) {
    return request(url, params, options, 'delete');
}
// 封装POST请求
function patch(url, params, options){
    return request(url, params, options, 'patch')
}
export default {
    get,
    post,
    delete: del,
    patch
}