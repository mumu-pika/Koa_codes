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
      //设置文件的默认保存目录，不设置则保存在系统临时目录下
      uploadDir: path.resolve(__dirname, '../static/uploads'),
    },
    multipart: true, // 支持文件上传
  })
)

app.use(koaStatic(path.resolve(__dirname, '../static')))

//二次处理文件，修改名称
app.use((ctx) => {
  console.log(ctx.request.files)

  let files = ctx.request.files.f1 //得到上传文件的数组
  const result = []
  console.log(files)

  if (!Array.isArray(files)) {
    //单文件上传容错
    files = [files]
  }

  files &&
    files.forEach((item) => {
      const path = item.path.replace(/\\/g, '/')
      const fname = item.name //原文件名称
      let nextPath = path + fname
      if (item.size > 0 && path) {
        //得到扩展名
        const extArr = fname.split('.')
        const ext = extArr[extArr.length - 1]
        nextPath = path + '.' + ext
        //重命名文件
        fs.renameSync(path, nextPath)

        result.push(uploadHost + nextPath.slice(nextPath.lastIndexOf('/') + 1))
      }
    })

  ctx.body = `{
        "fileUrl":${JSON.stringify(result)}
    }`
})

/**
 * Create HTTP server.
 */
const server = http.createServer(app.callback())
server.listen(port)
console.log('"多文件上传-xhr formdata " server start at port:', port, '......')
