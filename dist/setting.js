"use strict";
/// <reference path="../src/localstorage.ts"/>
/// <reference path="../src/elector.ts"/>
function click_setting_icon() {
    $("#settings-div").toggleClass("none-display");
}
function start_change_electors() {
    $("#electors-change").toggleClass("none-display");
}
function show_storage() {
    if ($("#storage-showing-temp").length !== 0)
        return;
    var storage = JSON.stringify({
        "version": LC.config.version,
        "title": LC.config.title,
        "mainSepLine": LC.config.mainSepLine,
        "secSepLine": LC.config.secSepLine,
        "votes": LC.config.votes,
        "electorNames": LC.config.electorNames,
        "voteSingle": LC.config.voteSingle,
        "invalidVote": LC.config.invalidVote
    }), $showingDiv = $("<div></div>")
        .css({ "position": "fixed", "box-sizing": "border-box", "width": "70vw", "height": "70vh", "top": "15vh", "left": "15vw", "background-color": "#eeeeee", "padding": "5rem 1rem 1rem 1rem", "overflow-y": "auto" })
        .attr({ "id": "storage-showing-temp" })
        .append($(`<div><img src="img/close.svg"></div>`).attr({ "class": "button-d close-icon-fullscreen" }).on('click', function () { $("#storage-showing-temp").remove(); }))
        .append($("<p>這是你的投票唯一記錄摘要(128bit)。對比它可以瞭解投票是否被修改過。</p>"))
        .append($("<textarea></textarea>").val(LC.config.unique_code()).css({ "resize": "none", "height": "2rem", "width": "100%" }).attr({ "disabled": "disabled" }))
        .append($("<p>這是你的詳細存檔配置。請把它複製下來並保存到一個安全的地方。</p>"))
        .append($("<textarea></textarea>").val(storage).css({ "resize": "vertical", "min-height": "40vh", "width": "100%" }))
        .appendTo($("body"));
}
function import_storage() {
    if ($("#storage-import-temp").length !== 0)
        return;
    var $importDiv = $("<div></div>")
        .css({ "position": "fixed", "box-sizing": "border-box", "width": "70vw", "height": "70vh", "top": "15vh", "left": "15vw", "background-color": "#eeeeee", "padding": "5rem 1rem 1rem 1rem", "overflow-y": "auto" })
        .attr({ "id": "storage-import-temp" })
        .append($(`<div><img src="img/close.svg"></div>`).attr({ "class": "button-d close-icon-fullscreen" }).on('click', function () { $("#storage-import-temp").remove(); }))
        .append($("<p>請輸入你的存檔:</p>"))
        .append($("<textarea></textarea>").css({ "resize": "vertical", "min-height": "40vh", "display": "block", "width": "100%" }))
        .append($("<button class='button-d'>確定導入</button>").on('click', function () {
        LC.config = LC.to_config(JSON.parse($("#storage-import-temp>textarea").val()));
        LC.set_init();
        $("#storage-import-temp").remove();
        LC.config.update();
        location.href = location.href;
    }))
        .appendTo($("body"));
}
function is_same(a1, a2) {
    var a1len = a1.length, a2len = a2.length;
    if (a1len !== a2len)
        return false;
    for (let i in a1)
        if (a1[i] !== a2[i])
            return false;
    return true;
}
function submit_setting(save = false) {
    var config_new = LC.to_config({
        version: LC.config.version,
        title: $("#titleSet").val(),
        mainSepLine: $("#mainSepLineSet").val(),
        secSepLine: $("#secSepLineSet").val(),
        votes: LC.config.votes,
        electorNames: $("#electors-list").val().split(","),
        voteSingle: LC.config.voteSingle
    });
    if (config_new.title !== LC.config.title) {
        LC.config.set_title(config_new.title);
        if (save)
            LC.config.update_title();
    }
    if (config_new.mainSepLine !== LC.config.mainSepLine) {
        LC.config.set_mainSepLine(config_new.mainSepLine);
        if (save)
            LC.config.update_basic();
    }
    if (config_new.secSepLine !== LC.config.secSepLine) {
        LC.config.set_secSepLine(config_new.secSepLine);
        if (save)
            LC.config.update_basic();
    }
    if (!is_same(config_new.electorNames, LC.config.electorNames)) {
        LC.config.set_electorNames(config_new.electorNames);
        if (save)
            LC.config.update_basic();
        Ele.electors = [];
        LC.config.votes = [];
        $("#vote-buttons").empty(),
            $("#rank-chart").empty();
        let $voteButtons_temp = $("#vote-buttons"), $rankChart_temp = $("#rank-chart");
        for (let i in config_new.electorNames) {
            let electorName = config_new.electorNames[i], new_elector = new Ele.Elector(parseInt(i) + 1, electorName, 0);
            new_elector.voteButton.appendTo($voteButtons_temp);
            new_elector.voteButton.on("click", { id: new_elector.get_id() }, function (event) {
                Ele.electors[event.data.id - 1].add_vote();
            });
            new_elector.rankSpan.appendTo($rankChart_temp);
            Ele.electors.push(new_elector);
            LC.config.votes.push(0);
            if (parseInt(i) === config_new.electorNames.length - 1) {
                new_elector.set_vote();
            }
        }
    }
    $("#settings-div").addClass("none-display");
}
function reset_setting() {
    $("#titleSet").val("計票器");
    $("#mainSepLineSet").val(6);
    $("#secSepLineSet").val(3);
    $("#electors-list").val("張三,李四,王五");
}
function remove_elector(elector) {
    if (Ele.electors.length <= 1)
        return;
    var eid = elector.get_id();
    elector.rankSpan.remove();
    elector.voteButton.remove();
    Ele.totalVotes -= elector.get_vote();
    $("#valid-vote").text((Ele.totalVotes - LC.config.invalidVote).toString());
    $("#total-vote").text(Ele.totalVotes.toString());
    Ele.electors.splice(eid - 1, 1);
    LC.config.votes.splice(eid - 1, 1);
    LC.config.electorNames.splice(eid - 1, 1);
    for (let e of Ele.electors) {
        if (e.get_id() > eid) {
            e.set_id(e.get_id() - 1);
            e.voteButton.on("click", { id: e.get_id() }, function (event) {
                Ele.electors[event.data.id - 1].add_vote();
            });
        }
    }
    Ele.electors[0].set_vote();
    LC.config.update_basic();
    LC.config.update_votes();
}
function add_elector(afterid) {
    if (isNaN(afterid) || afterid > Ele.electors.length || afterid < 0)
        return;
    var newEle = new Ele.Elector(afterid + 1, "---", 0), $voteButtons = $("#vote-buttons"), $rankChart = $("#rank-chart");
    Ele.electors.splice(afterid, 0, newEle);
    newEle.voteButton.appendTo($voteButtons).on("click", { id: newEle.get_id() }, function (event) {
        Ele.electors[event.data.id - 1].add_vote();
    });
    newEle.rankSpan.appendTo($rankChart);
    LC.config.votes.splice(afterid, 0, 0);
    LC.config.electorNames.splice(afterid, 0, "---");
    for (let i in Ele.electors) {
        let e = Ele.electors[i];
        if (parseInt(i) > afterid) {
            e.set_id(e.get_id() + 1);
            e.voteButton.off("click")
                .on("click", { id: e.get_id() }, function (event) {
                Ele.electors[event.data.id - 1].add_vote();
            });
        }
    }
    Ele.electors[0].set_vote();
    LC.config.update_basic();
    LC.config.update_votes();
}
function close_electors_edit() {
    $('#electors-change').addClass('none-display');
    $('#changing-ways').attr({ 'active': '0' });
    $('#changing-frame').html('');
    $("#changing-ways").children().removeClass('active');
}
function start_electors_edit() {
    var $changingWays = $("#changing-ways"), $changingFrame = $("#changing-frame");
    if ($changingWays.attr("active") === "1")
        return;
    $changingWays.children().removeClass("active");
    $("#changing-ways>button:nth-of-type(1)").addClass("active");
    $changingWays.attr({ "active": "1" });
    var $editList = $("<div></div>").attr({ "id": "electors-edit-list" }).appendTo($changingFrame.html(''));
    for (let i in Ele.electors) {
        let e = Ele.electors[i], pi = parseInt(i);
        $("<div></div>").attr({ "index": i })
            .append($("<span></span>").text(e.get_id().toString()))
            .append($("<span></span>").text(e.get_rank().toString() + Ele.ordinal_suffix(e.get_rank())))
            .append($("<span></span>").attr({ "class": "button-i", "id": "changing-frame-edit-name-" + e.get_id().toString(), "contentEditable": "true" }).text(e.get_name()).on('input', { elector: e }, function (event) { event.data.elector.set_name($("#changing-frame-edit-name-" + event.data.elector.get_id().toString()).text()); }))
            .append($("<span></span>").attr({ "class": "button-i", "id": "changing-frame-edit-vote-" + e.get_id().toString(), "contentEditable": "true" }).text(e.get_vote()).on('input', { elector: e }, function (event) { var voteNew = parseInt($("#changing-frame-edit-vote-" + event.data.elector.get_id().toString()).text()); if (!isNaN(voteNew))
            event.data.elector.set_vote(voteNew); }))
            .append($("<button></button>").attr({ "class": "button-d" }).html("-").on('click', { elector: e }, function (event) { remove_elector(event.data.elector); $changingWays.attr("active", '0'); start_electors_edit(); }))
            .appendTo($editList);
    }
    $("<button></button>").attr({ "class": "button-d" }).text("插入").appendTo($changingFrame).on('click', function () {
        add_elector(parseInt($("#afterid").text()));
        $changingWays.attr("active", '0');
        start_electors_edit();
    });
    $("<span>在此序號之後:</span>").appendTo($changingFrame);
    $("<span></span>").attr({ "contentEditable": "true", "class": "button-i", "id": "afterid" }).text(Ele.electors.length.toString()).appendTo($changingFrame);
}
function start_electors_append() {
    var $changingWays = $("#changing-ways"), $changingFrame = $("#changing-frame");
    if ($changingWays.attr("active") === "2")
        return;
    $changingWays.children().removeClass("active");
    $("#changing-ways>button:nth-of-type(2)").addClass("active");
    $changingWays.attr({ "active": "2" });
    $changingFrame.html('<p>請輸入要增加的人員，用英文逗號或換行符分隔。</p>').append($("<textarea></textarea>").attr({ "id": "electors-append" }).css({ "width": "90%", "min-height": "2em", "resize": "vertical" }))
        .append($("<button></button>").text("確定").addClass("button-d").on('click', function () {
        var neles = $("#electors-append").val().replace("\r", "").replace("\n", ",").split(",");
        for (let i in neles) {
            add_elector(Ele.electors.length);
            Ele.electors[Ele.electors.length - 1].set_name(neles[i]);
        }
    }));
}
function start_electors_remove() {
    var $changingWays = $("#changing-ways"), $changingFrame = $("#changing-frame");
    if ($changingWays.attr("active") === "3")
        return;
    $changingWays.children().removeClass("active");
    $("#changing-ways>button:nth-of-type(3)").addClass("active");
    $changingWays.attr({ "active": "3" });
    $changingFrame.html('').append($("<div><span>刪除第n名及以後: </span><input type='number' id='electors-remove-nlast'></div>").append($("<button>確定</button>").attr({ "class": "button-d" }).on('click', function () {
        var n = parseInt($("#electors-remove-nlast").val());
        for (let i = 0; i < Ele.electors.length; i++) {
            let e = Ele.electors[i];
            if (e.get_rank() >= n) {
                remove_elector(e);
                i--;
            }
        }
    })))
        .append($("<div><span>刪除第n名及以前: </span><input type='number' id='electors-remove-nfirst'></div>").append($("<button>確定</button>").attr({ "class": "button-d" }).on('click', function () {
        var n = parseInt($("#electors-remove-nfirst").val());
        for (let i = 0; i < Ele.electors.length; i++) {
            let e = Ele.electors[i];
            if (e.get_rank() <= n) {
                remove_elector(e);
                i--;
            }
        }
    })));
}
