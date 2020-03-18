import chalk from 'chalk';

export default (api, {
  entry = './src',
  output,
  increment = true,
  word = 'lang'
} = {}) => {
  api.onStart(() => {
    if (!output) {
      throw new Error('output必填')
    }
  })

  api.onDevCompileDone(() => {
    const fs = require('fs')
    const readline = require('readline')
    const path = require('path')

    const reg = /(trans\(.*\))/gi
    const dispose = /\/\//
    const obj = {}
    const separator = `${word}[` // 分隔符
    const suffix = ['.js', '.jsx'] // 后缀白名单
    let readNum = 0
    console.log('-----start-----')

    function readFileToObj(fReadName, value, callback) {
      var fRead = fs.createReadStream(fReadName)
      var objReadline = readline.createInterface({
        input: fRead,
      });

      objReadline.on('line', line => {
        // 注释的忽略
        if (line.includes('//') || line.includes('*')) {
          return
        }
        if (line) {
          const arr = line.split(separator)
          if (arr.length > 1) {
            const bb = arr.slice(1)
            for (let i in bb) {
              const v0 = bb[i].split(']')[0]
              const v = v0.substr(1, v0.length - 2)
              if (!v) {
                // 空输出提示
                console.warn(`空行为：${line}`)
                continue
              }
              // 增量就不覆盖了
              if (increment && value && value[v]) {
                obj[v] = value[v]
              } else {
                obj[v] = v
              }

            }
          }
        }
      })
      objReadline.on('close', () => {
        if (--readNum === 0) {
          let result = JSON.stringify(obj, null, 2)
          fs.writeFile(output, result, err => {
            if (err) {
              console.warn(err)
            }
          })
          callback && callback()
        }
      })
    }


    const filePath = path.resolve(entry)

    // 递归执行，直到判断是文件就执行readFileToObj
    function fileDisplay(filePath, value, callback) {
      fs.readdir(filePath, (err, files) => {
        let count = 0
        function checkEnd() {
          if (++count === files.length && callback) {
            callback()
          }
        }
        if (err) {
          console.warn(err)
        } else {
          files.forEach(filename => {
            var fileDir = path.join(filePath, filename)
            fs.stat(fileDir, (err2, status) => {
              if (err2) {
                console.warn(err2)
              } else {
                if (status.isDirectory()) {
                  return fileDisplay(fileDir, value, checkEnd)
                }
                else if (status.isFile()) {
                  // 后缀不符合的跳过
                  if (!suffix.includes(path.extname(fileDir))) {
                    // return
                  } else {
                    readNum++
                    readFileToObj(fileDir, value)
                  }
                }
                checkEnd()
              }
            })
          })
        }
      })
    }


    // 开始逻辑
    function run() {
      new Promise((resolve, reject) => {
        fs.exists(output, exists => {
          // 存在且增量生成
          if (exists && increment) {
            console.log('增量更新')
            fs.readFile(output, 'utf-8', (err, data) => {
              if (err) {
                console.warn(err)
              } else {
                try {
                  // 旧文件已存在的json
                  const json = JSON.parse(data)

                  resolve(json)
                } catch (e) {
                  // 翻车
                  console.warn(e)
                }
              }
            })
          } else {
            console.log('全量更新')
            resolve()
          }
        })
      }).then(value => {
        let startTime = Date.now()
        fileDisplay(filePath, value, function (value) {
          console.log('finish:', Date.now() - startTime)
        })
      })
    }
    run()

  });
};