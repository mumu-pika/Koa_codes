/**
 * 服务入口
 */
const http = require('http')
const koaStatic = require('koa-static')
const path = require('path')
const koaBody = require('koa-body')
const fs = require('fs')
const Koa = require('koa2')

const app = new Koa()
const port = process.env.PORT || '8100'

const uploadHost = `http://localhost:${port}/uploads/`

app.use(
  koaBody({
    formidable: {
      //设置文件的默认保存目录，不设置则保存在系统临时目录下  os
      uploadDir: path.resolve(__dirname, '../static/uploads'),
    },
    multipart: true, // 支持文件上传
  })
)

//开启静态文件访问
app.use(koaStatic(path.resolve(__dirname, '../static')))

//二次处理文件，修改名称
app.use((ctx) => {
  // upfile.html
  if (ctx.path === '/upfile') {
    //获取到上传的文件对象
    const file = ctx.request.files ? ctx.request.files.f1 : null
    if (file) {
      const path = file.path.replace(/\\/g, '/')
      const fname = file.name //原文件名称
      let nextPath = ''
      if (file.size > 0 && path) {
        //得到扩展名
        const extArr = fname.split('.')
        const ext = extArr[extArr.length - 1]
        nextPath = path + '.' + ext
        //重命名文件
        fs.renameSync(path, nextPath)
      }
      //以 json 形式输出上传文件地址
      ctx.body = getRenderData({
        data: `${uploadHost}${nextPath.slice(nextPath.lastIndexOf('/') + 1)}`,
      })
    } else {
      ctx.body = getRenderData({
        code: 1,
        msg: 'file is null',
      })
    }
  }
})

/**
 *
 * @param {设置返回结果} opt
 */
function getRenderData(opt) {
  return Object.assign(
    {
      code: 0,
      msg: '',
      data: null,
    },
    opt
  )
}

/**
 * http server
 */
const server = http.createServer(app.callback())
server.listen(port)
console.log('upload file server start：',port, '......')
