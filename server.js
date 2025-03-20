const express=require('express');
const bodyParser =require('body-parser');
const app=express();
const axios = require('axios');
const mysql = require('mysql2');
app.use(bodyParser.json())

//处理post请求
app.post('/',(req,res) => {
  console.log(req.body)
  res.json(req.body)
})

app.post('/show',(req,res)=>{
  console.log(req.body.userId)
  const a=req.body.userId
  var connection=mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'123456',
    database:'demo'
  })
  connection.connect();
  connection.query("select * from user_fortune where user_id='"+a+"'",function(error,results){
    if(error) throw console.error;
    res.json({data:results});
    console.log(results)
    
  })
  connection.end();
  
})

app.post('/insertFortune', (req, res) => {
  // 从请求体中获取要插入的数据
  const userId = req.body.userId;
  const username = req.body.username;
  const name = req.body.name;
  const birthdate = req.body.birthdate;
  const birthdateType = req.body.birthdateType;
  const birthTime = req.body.birthTime;
  const fortuneSum = req.body.fortuneSum;
  const fortuneDesc = req.body.fortuneDesc;
  const createTime = new Date();
  const updateTime = new Date();
  const remark = req.body.remark;

  // 创建数据库连接
  var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'demo'
  });

  // 连接到数据库
  connection.connect();

  // 定义插入数据的 SQL 查询
  const insertQuery = "INSERT INTO user_fortune (user_id, username,name,birthdate,birthdate_type,birth_time,fortune_sum,fortune_desc,remark"+
  ") VALUES (?,?,?,?,?,?,?,?,?)";
  const values = [userId, username,name, birthdate, birthdateType, birthTime,fortuneSum,fortuneDesc, remark];

  // 执行插入查询
  connection.query(insertQuery, values, function (error, results) {
    if (error) {
      console.error(error);
      res.status(500).json({ error: '插入数据时发生错误' });
    } else {
      res.json({ message: '数据插入成功', insertId: results.insertId });
      console.log('数据插入成功，插入 ID: ', results.insertId);
    }
  });

  // 关闭数据库连接
  connection.end();
});


app.post('/getFortune', async (req, res) => {
  const userId = req.body.userId;
  const username = req.body.username;
  const name = req.body.name;
  const birthdate = req.body.birthday;
  const gender = req.body.gender;
  const birthdateType = req.body.birthdateType;
  const birthTime = req.body.birthTime;
  const createTime = new Date();
  const updateTime = new Date();
  const remark = req.body.remark;
  // 这里需要替换为你实际的 DeepSeek API 密钥
  const apiKey = 'sk-axmooziidkvlcgxtjjtivmekwjgqlttcthvfnjkzaklmicnd'; 
  const baseUrl = "https://api.siliconflow.cn";

  // 定义请求数据
  const options = {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: "Qwen/QwQ-32B",
      messages: [{ role: "user", content: gender+','+birthdate+'出生，请写一句诗描述下本月运势' }],
      stream: false,
      max_tokens: 2048,
      stop: null,
      temperature: 0.7,
      top_p: 0.7,
      top_k: 50,
      frequency_penalty: 0.5,
      n: 1,
      response_format: { type: "text" }
    })
  };

  try {
    // 使用 async/await 处理 fetch 请求
    const response = await fetch(`${baseUrl}/v1/chat/completions`, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    // 打印 message
    console.log(data.choices[0].message);
    // 打印完整的 response
    console.log(data);

    // 假设运势信息在 response.choices[0].message.content 中
    const fortuneSum = data.choices[0].message.content;
    const fortuneDesc = data.choices[0].message.reasoning_content;
    res.json({ fortuneSum:fortuneSum,fortuneDesc:fortuneDesc});
    // 创建数据库连接
  var connection = mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '123456',
      database: 'demo'
    });

    // 连接到数据库
    connection.connect();

    // 定义插入数据的 SQL 查询
    const insertQuery = "INSERT INTO user_fortune (user_id, username, name, birthdate, birthdate_type, birth_time, fortune_sum, fortune_desc, remark) VALUES (?,?,?,?,?,?,?,?,?)";
    const values = [userId, username, name, birthdate, birthdateType, birthTime, fortuneSum, fortuneDesc, remark];

    // 执行插入查询
    connection.query(insertQuery, values, function (error, results) {
      if (error) {
        console.error(error);
        res.status(500).json({ error: '插入数据时发生错误' });
      } else {
        res.json({ message: '数据插入成功', insertId: results.insertId ,fortuneSum:fortuneSum,fortuneDesc:fortuneDesc});
        console.log('数据插入成功，插入 ID: ', results.insertId);
      }
      // 关闭数据库连接
      connection.end();
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '请求 API 时发生错误' });
  } 
});

app.get('/',(req,res)=>{
  var connection = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'123456',
    database:'demo'
  });
  connection.connect();
  //查找所有的人物名字返回给客户端。其实没必要（测试用的）
  connection.query('select * from users',function(error,results,fields){
    if(error) throw error;
    
    res.json({data:results});
    // console.log(results)
  })
  connection.end();
})

app.listen(3000,()=>{
  console.log('server running at http://127.0.0.1:3000')
})
