//获得video元素
const video = document.getElementById("video");
//启动摄像头
const startVideo = () => {
  navigator.mediaDevices
    .getUserMedia({
      video: {},
    })
    .then((stream) => {
      video.srcObject = stream;
    })
    .catch((err) => {
      console.error("error:", err);
    });
};

//加载全部模型
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("./models"), //加载人脸检测模型
  faceapi.nets.faceLandmark68Net.loadFromUri("./models"), //加载人脸关键点检测模型
  faceapi.nets.faceRecognitionNet.loadFromUri("./models"), //加载人脸识别模型
  faceapi.nets.faceExpressionNet.loadFromUri("./models"), //加载人脸表情识别模型
  faceapi.nets.ageGenderNet.loadFromUri("./models"), //加载年龄和性别识别模型
]).then(startVideo);

//监听video元素的play事件
video.addEventListener("play", () => {
  //设置画布
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);
  //设置画布大小
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);
  setInterval(async () => {
    //获取人脸检测结果
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptors()
      .withFaceExpressions()
      .withAgeAndGender();
    //获取画布上下文
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    //清除画布
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    //绘制人脸检测结果
    faceapi.draw.drawDetections(canvas, resizedDetections);
    //绘制人脸关键点
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    //绘制人脸表情
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
    //绘制年龄和性别

    // resizedDetections.forEach((detection) => {
    //   const {
    //     age,
    //     detection: { box },
    //   } = detection;
    //   const bottomRight = {
    //     x: box.x + box.width,
    //     y: box.y + box.height,
    //   };
    //   new faceapi.draw.DrawTextField(
    //     [`${parseInt(age, 10)} years`],
    //     bottomRight
    //   ).draw(canvas);
    // });//样式不一样

    // 绘制年龄文本框
    resizedDetections.forEach((detection) => {
      const { age } = detection;
      const bottomRight = {
        x: detection.detection.box.bottomRight.x - 50,
        y: detection.detection.box.bottomRight.y,
      };
      new faceapi.draw.DrawTextField(
        [`${parseInt(age, 10)} years`],
        bottomRight
      ).draw(canvas);
    });
    // 设置定时器，每100毫秒执行一次绘制操作
  }, 100);
});
