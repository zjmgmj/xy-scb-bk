const axios = require('axios')
const Qs = require('qs')
const sha1 = require('sha1')
const cookie = 'JSESSIONID=CFD195FB182E02ADE7366E1DB86758E4'
module.exports = {
  proxyToken(key) {
    let date = new Date()
    if (date.getTimezoneOffset() !== -480) {
      console.log('currentTimezone:>>>', date.getTimezoneOffset())
      date = new Date(date.getTime() + 480 * 60 * 1000)
    }
    const dateStr =
      date.getFullYear() +
      '-' +
      (date.getMonth() + 1 > 9
        ? date.getMonth() + 1
        : '0' + (date.getMonth() + 1)) +
      '-' +
      (date.getDate() > 9 ? date.getDate() : '0' + date.getDate())
    return sha1(dateStr + key)
  },
  httpGet(url) {
    return axios({
      method: 'get',
      url: url,
      headers: {
        'Connection': 'keep-alive',
        'Cookie': cookie
        // 'zhdcrm-proxy-token': this.proxyToken('zhdcrm')
      }
    })
  },
  httpPost(url, body) {
    return axios({
      method: 'post',
      url: url,
      headers: {
        'Connection': 'keep-alive',
        // 'zhdcrm-proxy-token': this.proxyToken('zhdcrm')
        'Cookie': cookie
      },
      data: body,
      transformRequest: data => {
        return Qs.stringify(data, { arrayFormat: 'repeat', allowDots: true })
      }
    })
  },
  httpPostForm(url, body) {
    return axios({
      method: 'post',
      url: url,
      params: body,
      headers: {
        'Connection': 'keep-alive',
        // 'zhdcrm-proxy-token': this.proxyToken('zhdcrm'),
        'Cookie': cookie,
        'Content-Type': 'multipart/form-data'
      },
      paramsSerializer: params => {
        return Qs.stringify(params, { arrayFormat: 'brackets' })
      }
    })
  },
  httpDelete(url, body) {
    return axios({
      method: 'delete',
      url: url,
      params: body,
      headers: {
        'Connection': 'keep-alive',
        'Cookie': cookie
        // 'zhdcrm-proxy-token': this.proxyToken('zhdcrm')
      },
      paramsSerializer: params => {
        return Qs.stringify(params, { arrayFormat: 'brackets' })
      }
    })
  },
  httpStreamPost(url, body) {
    return axios.post(url, body)
  },
  httpPut(url, body) {
    console.log('---------put')
    return axios({
      method: 'put',
      url: url,
      params: body,
      headers: {
        'Connection': 'keep-alive',
        'Cookie': cookie
        // 'zhdcrm-proxy-token': this.proxyToken('zhdcrm')
      },
      paramsSerializer: params => {
        return Qs.stringify(params, { arrayFormat: 'brackets' })
      }
    })
  }
}
