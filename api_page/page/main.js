var chatassistant = function(chat){
    var chattxt = '<div class="sb-side sb-side-left"><div class="assistant">'+chat+'</div></div>';
    $('#chat').append(chattxt);
}

var chatuser = function(chat){
    var chattxt = '<div class="sb-side sb-side-right"><div class="user">'+chat+'</div></div>';
    $('#chat').append(chattxt);
}




// Post時の処理
function post(){
    // FastAPIのアドレス
    const ipadd = "http://127.0.0.1:8000";
    const url_dic = ["/rinneimage","/rinnechat"]
    // ボタンを無効化
    var button = $("#button");
    button.attr("disabled", true);

  
    
    // テキストボックスの値を取得
    var text = $("#text").val();
    var link = $("#link").val();
    // 送信用にJSON化
    var data = {
        "text":text,
        "url":link
    };
    console.log(data)

    
    var local = $('#mode_select').val();
    console.log(local);
    posturl = ipadd+url_dic[local];
    console.log(posturl);
    
    
    
    // 画面表示
    chatuser(text);

    // 画面をスクロール
    var container = document.getElementById('chat');
        if ( !isScrollBottom(container)) {
            scrollToBottom(container);
        }

    // データを送信
    $.ajax({
        type: "post",
        timeout: 400000,
        url: posturl, 
        headers: {
            "Authorization": "Basic " + btoa("user:password") // 必要な場合は認証をかける
        },
        strictSSL:false,
        dataType : "json",
        data:JSON.stringify(data),
        contentType: "application/json",
        success: function(jsondata){ // 値が返ってきたらここが実行される
            if(jsondata.code=="9"){
                chatassistant("エラー（応答が遅いなど）");
            }
            else{    
                $("#sound").get(0).play();
                chatassistant(jsondata.message); // 返ってきたデータを画面表示
            }

            // 画面をスクロール
            var container = document.getElementById('chat');
            if ( !isScrollBottom(container)) {
                scrollToBottom(container);
            }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown){ // 値が返ってこなかった場合
            console.log("error");
            chatassistant(textStatus);

            // 画面をスクロール
            var container = document.getElementById('chat');
            if ( !isScrollBottom(container)) {
                scrollToBottom(container);
            }
        },
        complete: function(){ // 常にこの処理をする
            // ボタンを有効化
            button.attr("disabled", false);
            $("#text").val("");

            // 画面をスクロール
            var container = document.getElementById('chat');
            if ( !isScrollBottom(container)) {
                scrollToBottom(container);
            }
        }
    });
}

// 自動スクロール処理
var scrollToBottom = (target) => {
    target.scrollTop = target.scrollHeight;
};

var isScrollBottom = (target) => {
    return target.scrollHeight === target.scrollTop + target.offsetHeight;
};

// ボタンが押されたときに実行されるもの
$(function(){
    $("#button").click(function(event){
        post();
    });
});

// Enterキーが押されたときに実行されるもの
function handleEnterKey(event) {
    if (event.keyCode === 13) { // Enterキーのキーコードは13
        if($('#buton').attr("disabled") == false){
            post();
        }
    }
}

//画像ファイルがアップロードされたときに実行されるもの
$("#image_file").change(function(e){
    var file=e.target.files[0];
    var reader = new FileReader();
    if(file.type.indexOf('image') < 0){
        alert("画像ファイルを指定してください。");
        return false;
      }
    reader.onload = (function(file){
        return function(e){
            $('#preview_img').attr('src', e.target.result);
            $('#preview_img').attr('title', file.name);
        };
    })(file);
    reader.readAsDataURL(file);
    $("#link").hide()

    var fd = new FormData();
    fd.append('file',$('#image_file').prop("files")[0]);

    $.ajax({
        type: "post",
        timeout: 400000,
        url: "http://127.0.0.1:8000/upimage",
        headers: {
            "Authorization": "Basic " + btoa("user:password") // 必要な場合は認証をかける
        },
        strictSSL:false,
        dataType : "json",
        data: fd,
        processData: false,
        contentType: false,
        success: function(jsondata){
            $("#link").val(jsondata.image_dic);
        }
    });
});

//画像urlが入れられたときに実行されるもの
$("#link").on("change", function(evt){
    console.log(this.value);
    $("#preview_img_url").html("<img src='" + this.value + "' id='preview_img'>");
    $("#image_file").prop("disabled",true);
});

//リセットボタンが押されたときに実行されるもの
$("#clear").on("click", function(){
    $('input[type="file"]').val(null);
    $("#preview_img_url").html("<img src='" + "' id='preview_img'>");
    $("#image_file").prop("disabled",false);
    $("#link").prop("disabled",false);
    $("#link").val("");
    $("#link").show();
    $('#mode_select').val(0);
    $("#link").attr("placeholder","ここに画像URLを");
})

//セレクタボックスが選択されたときに実行されるもの
$("#mode_select").change(function(){
    console.log($(this).val())
    if($(this).val()==0){
        $("#link").show();
        $("#image_file").prop("disabled",false);
        $("#link").attr("placeholder","ここに画像URLを");
    }else if($(this).val()==1){
        $('input[type="file"]').val(null);
        $("#preview_img_url").html("<img src='" + "' id='preview_img'>");
        $("#image_file").prop("disabled",true);
        $("#link").hide();
        $("#link").val("");
        $("#link").attr("placeholder","チャットモデルが選択されているため入力不可");
    }
})


const inputElement = document.getElementById("text");
inputElement.addEventListener("keydown", handleEnterKey);
