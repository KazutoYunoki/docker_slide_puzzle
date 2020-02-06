var panel = [];  //ランダムに並び替える用の配列
var baseTime = new Date();
var currentTime = new Date();
var isTimeStopped = true;
var passedTime = 0;
var starXInitial = 200;  //★パネルの初期left値
var starYInitial = 200;  //★パネルの初期right値
var starX = starXInitial;
var starY = starYInitial;
var clear = 0;  //クリアー判定用
var isCleared = false;

//ミリ秒の整数値から時間分秒の情報を取得する関数
function timeToInfo(time){
  var timeInfo = new Object();
  timeInfo.hours = (Math.floor(passedTime / 1000 / 60 / 60)) % 24;
  timeInfo.minutes = (Math.floor(passedTime / 1000 / 60)) % 60;
  timeInfo.seconds = (Math.floor(passedTime / 1000)) % 60;
  timeInfo.milisecs = passedTime % 1000;
  return timeInfo;
}

//クリア後にすること
function procedureAfterCleared(){
  isCleared = true;
  isTimeStopped = true;

  //記録の順位の計算：recordTimesはこれまでの記録(ミリ秒)が小さいものから並んだ配列
  var recordTime = passedTime;
  var place;
  for(place = 0; place < recordTimes.length; place++){
    if(recordTime < recordTimes[place]){
      break;
    }
  }

  //「xx時間xx分xx.xx秒」という記録表示のための文字列を構築
  var recordTimeInfo = timeToInfo(recordTime);
  var recordTimeStr = "";
  if(recordTimeInfo.hours != 0){
    recordTimeStr += (recordTimeInfo.hours + "時間")
  }
  if(recordTimeInfo.minutes != 0){
    recordTimeStr += (recordTimeInfo.minutes + "分")
  }
  recordTimeStr += (recordTimeInfo.seconds + ".")
  recordTimeStr += (("00"+recordTimeInfo.milisecs).slice(-3) + "秒")

  var userName = window.prompt("おめでとうございます！ただいまの記録は"+recordTimeStr+"で、第"+(place+1)+"位です！\nユーザーネームを入力してください。");
  var req = new XMLHttpRequest();
  req.open("POST", "/", false);
  req.setRequestHeader('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
  req.send("name="+userName+"&time="+recordTime+"&timestr="+recordTimeStr);
  location.reload();
}

//チート関数：動作確認用
function cheat() {
  procedureAfterCleared();
}
//パネルのシャッフル関数
function panel_shuffle(panel){
   panel.sort(function(){
      return Math.random() - Math.random();
   })
}
//パズルが解けるか解けないか判定する用
function pazzle_solution(panel){
   var temp;
   var count = 0;
   for (var i = 0; i < 8; i++){
     if (panel_copy[i] == i){
        continue;
     }
     else{
        for (var j = i; j < 8; j++){
           if (panel_copy[j] == i){
              temp = panel_copy[j];
              panel_copy[j] = panel_copy[i];
              panel_copy[i] = temp;
              count++;
              break;
           }
        }
     }
  }
  if(count % 2 ==0){
     return true;
  }
  else{
     return false;
  }
}
//パネルのランダム配置
function panel_reset(panel){
   var i, j, tmp;
   for (i = panel.length - 1; i > 0; i--) {
     r = Math.floor(Math.random() * (i + 1));
     tmp = panel[i];
     panel[i] = panel[r];
     panel[r] = tmp;
   }
   for (i = 0; i < panel.length - 1; i++) {
     if (panel[i] == 8) {
      tmp = panel[i];
      panel[i] = panel[8];
      panel[8] = tmp;
      break;
     }
   }
}
//クリアー判定
function gameClear() {
  for (i = 0; i < 8; i++) {
    var x = parseInt($("#" + i).css("left")) / 100;
    var y = parseInt($("#" + i).css("top")) / 100;
    var clearX = i % 3;
    var clearY = Math.floor(i / 3)
    if ((clearX == x) && (clearY == y)) {  //0～8のパネルが正しい位置にあるかを確認
      clear++;  //OKならclearに+1
    }
  }
  if (8 <= clear) {  //8枚のパネルが全て正しい位置にあれば
    procedureAfterCleared();
  }
  clear = 0;
}

//スタートボタンとリセットボタンの切り替えと、各ボタンの処理
function startResetButton() {
  var toggleBtn = document.getElementById("start_reset_button");
　var toggleBtnClass = toggleBtn.getAttribute("class");

  if(toggleBtnClass == "start_button"){  //スタートボタンを押したときの処理
    toggleBtn.classList.remove('start_button');
    toggleBtn.classList.add('reset_button');
    document.getElementById('start').style.display='none';
    document.getElementById('reset').style.display='block';
    isTimeStopped = false;
  }else{  //リセットボタンを押したときの処理
    toggleBtn.classList.remove('reset_button');
    toggleBtn.classList.add('start_button');
    document.getElementById('reset').style.display='none';
    document.getElementById('start').style.display='block';

    baseTime = new Date();
    passedTime = 0;
    isTimeStopped = true;
    isCleared = false;

    panel_reset(panel);

    //パネルのコピー
    panel_copy = panel.concat();

    //パズルの解がない場合、さらにシャッフル
    if(pazzle_solution(panel_copy) == false){
       panel_reset(panel_copy);
    }

    starX = starXInitial;
    starY = starYInitial;

    for (i = 0; i < 9; i++) {
      var x = Math.floor(i % 3) * 100;  //パネルのleft値
      var y = Math.floor(i / 3) * 100;  //パネルのtop値
      $("#" + panel[i]).css({ "left": x, "top": y });  //生成したパネルの位置指定
    }
  }

}


$(function () {

  //ランダム配置するパネルの枚数分の番号を配列に格納
  for (i = 0; i < 8; i++) {
    panel.push(i)
  };

  //パネルのシャッフル
  panel_shuffle(panel);

  //パズルの解がない場合、さらにシャッフル
  panel_copy = panel.concat();
  if(pazzle_solution(panel_copy) == false){
     panel_shuffle(panel);
  }

  panel.push(8);

  //8枚のパネルの生成
  var fileNameBase = "cat2_300x300_";
  for (i = 0; i < 8; i++) {
    $("#puzzle").append("<li id='" + panel[i] + "'><img src='../static/images/" + fileNameBase + panel[i] + ".png'></li>");
    var x = Math.floor(i % 3) * 100;  //パネルのleft値
    var y = Math.floor(i / 3) * 100;  //パネルのtop値
    $("#" + panel[i]).css({ "left": x, "top": y });  //生成したパネルの位置指定
  }
  $("#puzzle").append("<li id='8'><img src='../static/images/" + fileNameBase + panel[i] + "\.png'></li>");  //★パネル生成
  $("#8").css({ "left": starX, "top": starY });  //★パネルの位置指定

  //パネルクリック時の処理
  $("#puzzle li").on("click", function () {
    if(!isTimeStopped){
      var idX = parseInt($(this).css("left"));  //クリックしたパネルのleft値を保存
      var idY = parseInt($(this).css("top"));  //クリックしたパネルのtop値を保存
      if (((idX == starX) && ((idY == starY - 100) || (idY == starY + 100))) || ((idY == starY) && ((idX == starX - 100) || (idX == starX + 100)))) {  //クリックしたパネルが★と隣接していれば…
        $(this).css({ "left": starX, "top": starY });  //クリックしたパネルを★の位置に移動
        $("#8").css({ "left": idX, "top": idY });  //★をクリックしたパネルの位置に移動
        starX = idX;  //変数に保存していた★マークのleft値を現在の値に更新
        starY = idY;  //変数に保存していた★マークのtop値を現在の値に更新
      }
      gameClear();  //クリアー判定の関数を実行
    }
  });

  (function (d) {
    var p = d.getElementsByName("timer")[0];

    setInterval(function () {
      currentTime = new Date();  //現在時刻を取得

      if (isTimeStopped){  //時間が止まっている場合と止まっていない場合
        baseTime = new Date(currentTime.getTime() - passedTime);  //起点の時間と現在時刻との差を一定に保ち時間経過が止まっているように見せる
      }else{
        passedTime = currentTime.getTime() - baseTime.getTime();  //現在時刻から起点の時間を引いたものが経過時間
      }

      var passedTimeInfo = timeToInfo(passedTime);  //経過時間(ミリ秒)から時間分秒の情報を取得
      var str =  //経過時間を文字列として構築して表示する
        ("0" + passedTimeInfo.hours).slice(-2) + ":" +
        ("0" + passedTimeInfo.minutes).slice(-2) + ":" +
        ("0" + passedTimeInfo.seconds).slice(-2) + "." +
        ("00" + passedTimeInfo.milisecs).slice(-3);
      p.textContent = str;
    }, 0);
  }(document));

});
