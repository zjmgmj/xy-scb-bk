// const url = require('url')
const fs = require('fs')

const multipart = require('connect-multiparty')
const multipartMiddleware = multipart()
const rqt = require('request')
const qs = require('qs')

const express = require('express')
const router = express.Router()
const app = express()

const hptl = require('../utils/httpUtil')
const proxyUrl = 'http://192.168.80.211:8080/'  // tomcat
// const proxyUrl = 'http://192.168.80.149:8080/'  // jboss
// const proxyUrl = 'http://172.16.120.203:8080/'
// const proxyUrl = 'http://localhost:8080/'

router.use((req, res, next) => {
  Object.setPrototypeOf(req, app.request)
  Object.setPrototypeOf(res, app.response)
  req.res = res
  res.req = req
  next()
})

router.get('/test', (req, res) => {
  console.log('backend test')
  hptl.httpGet(proxyUrl + '/test').then(
    ({ data }) => {
      res.json(data)
    },
    err => {
      console.log(err)
      res.json({ returnCode: -1, errMsg: '网络异常' })
    }
  )
})

router.post('/test', (req, res) => {
  console.log('test post:' + JSON.stringify(req.body))
  hptl.httpPost(proxyUrl + 'test', { name: '测试' }).then(({ data }) => {
    console.log(data)
    res.json({ returnCode: 0 })
  })
})

router.post('/logout', (req, res) => {
  if (req.session.currentUser) delete req.session.currentUser
  res.json({ returnCode: 0 })
})

router.get('/hello', (req, res) => {
  res.json({ text: 'hello world' })
})

router.post('/fileImport/post', multipartMiddleware, (req, res) => {  
  const body = req.body
  console.log('body>>>', body)
  if (!body.url) {
    res.json({ returnCode: -1, errMsg: 'url参数未指定' })
    return
  }
  const formData = {}
  Object.keys(body).forEach(x=>{
    if (x!=='url')
    formData['oaFile.'+x]=body[x]
  })
  formData['oaFile.filePath'] = fs.createReadStream(req.files.uploadfile.path)
  formData['uploadfile'] = formData['oaFile.filePath']
  // uploadfile
  rqt.post(
    {
      url: proxyUrl + body.url,
      formData: formData
      // headers: { 'zhdcrm-proxy-token': hptl.proxyToken('zhdcrm') }
    },
    function(err, resp, body) {
      console.log('err:>>', err)
      console.log('body:>>', typeof body)
      fs.unlink(req.files.uploadfile.path, function(err) {
        if (err) console.error(err)
        else console.log('temp file delete success')
      })
      res.send(body)
    }
  )
})


router.post('/fileUpload', multipartMiddleware, (req, res) => {
  console.log('fileUpload----------', req)
  const url = req.body.url
  if (!url) {
    res.json({ returnCode: -1, errMsg: 'url参数未指定' })
    return
  }
  const formData = {
    uploadExcel: fs.createReadStream(req.files.uploadExcel.path)
  }
  if (req.body.headerName) formData.headerName = req.body.headerName
  if (req.body.valueName) formData.valueName = req.body.valueName
  rqt.post(
    {
      url: proxyUrl + url,
      formData: formData,
      // headers: { 'zhdcrm-proxy-token': hptl.proxyToken('zhdcrm') }
    },
    function(err, resp, body) {
      console.log('err:>>', err)
      console.log('body:>>', typeof body)
      fs.unlink(req.files.uploadExcel.path, function(err) {
        if (err) console.error(err)
        else console.log('temp file delete success')
      })
      res.send(body)
    }
  )
})

router.post('/download', (req, res, next) => {
  const body = req.body
  rqt.post({
    url: proxyUrl + body.url,
    gzip: true,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    form: qs.stringify(body.params, { arrayFormat: 'repeat', allowDots: true })
  })
    .pipe(res)
})

function getClientIP(req) {
  return (
    req.headers['x-forwarded-for'] || // 判断是否有反向代理 IP
    req.connection.remoteAddress || // 判断 connection 的远程 IP
    req.socket.remoteAddress || // 判断后端的 socket 的 IP
    req.connection.socket.remoteAddress
  )
}

router.post('/common/post', (req, res) => {
  const body = req.body
  console.log('----------1', body)
  hptl.httpPost(proxyUrl + body.url, body.params).then(
    ({ data }) => {
      if (
        (body.url === 'login' ||
          body.url === 'setting/acct/updateProfile' ||
          body.url === 'setting/acct/createOrUpdate') &&
        data.returnCode === 0
      ) {
        let currentUser = data.currentUser
        let originUser = req.session.currentUser
        if (body.url === 'login') {
          currentUser.loginTime = new Date().getTime()
          currentUser.ipAddress = getClientIP(req)
        } else {
          if (currentUser.id === originUser.id)
            currentUser.loginTime = originUser.loginTime
        }
        if (
          body.url !== 'setting/acct/createOrUpdate' ||
          (body.url === 'setting/acct/createOrUpdate' &&
            originUser.id === currentUser.id)
        )
          req.session.currentUser = currentUser
      }
      res.json(data)
    },
    err => {
      console.log(err)
      res.json({ returnCode: -1, errMsg: '网络异常' })
    }
  )
})

router.post('/common/put', (req, res) => {
  const body = req.body
  console.log(body)
  hptl.httpPut(proxyUrl + body.url, body.params).then(
    ({ data }) => {
      res.json(data)
    },
    err => {
      console.log(err)
      res.json({ returnCode: -1, errMsg: '网络异常' })
    }
  )
})

router.post('/common/get', (req, res) => {
  const body = req.body
  let paramsArr = []
  for (let key in body.params) {
    paramsArr.push(key + '=' + body.params[key])
  }
  const paramsStr = '?' + paramsArr.toString().replace(/,/g, '&')
  hptl.httpGet(encodeURI(proxyUrl + body.url + paramsStr)).then(
    ({ data }) => {
      res.json(data)
    },
    err => {
      console.log(err)
      res.json({ returnCode: -1, errMsg: '网络异常2' })
    }
  )
})

router.post('/common/del', (req, res) => {
  const body = req.body
  hptl.httpDelete(proxyUrl + body.url, body.params).then(
    ({ data }) => {
      res.json(data)
    },
    err => {
      console.log(err)
      res.json({ returnCode: -1, errMsg: '网络异常' })
    }
  )
})

module.exports = router
