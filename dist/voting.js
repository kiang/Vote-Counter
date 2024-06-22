"use strict";
/**
 * @file 創建投票區或投票人的變更
 */
/// <reference path="../src/elector.ts" />
/// <reference path="../src/localstorage.ts"/>
function add_voteNum(diff) {
    LC.config.set_voteSingle(LC.config.voteSingle + diff);
    LC.config.update_voteSingle();
}
function add_inVote(d = NaN) {
    if (isNaN(d))
        d = LC.config.voteSingle;
    LC.config.invalidVote += d;
    LC.config.update_inVote();
    Ele.totalVotes += d;
    $("#invalid-vote").text(LC.config.invalidVote.toString());
    $("#total-vote").text(Ele.totalVotes.toString());
    $("#valid-vote").text((Ele.totalVotes - LC.config.invalidVote).toString());
}
function reset_votes() {
    var i, e, pi;
    for (i in Ele.electors) {
        pi = parseInt(i);
        e = Ele.electors[i];
        e.set_vote(0, (pi === Ele.electors.length - 1));
    }
}
