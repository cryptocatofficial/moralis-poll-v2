// Moralis constants

const appId = "bGFmK42Sim5DylHEqailUpLBzzIav1Zj1smv3p9H";
const serverUrl = "https://wxgukjqft8nz.usemoralis.com:2053/server";

Moralis.start({ serverUrl, appId });

var pollOptionCount = 2;
var pollWhitelistCount = 2;



userNoSession = async() => {

    $("#sessionInfo").html(`
    <div class="card" style="color: black !important;">
                    <div class="card-body">
                        <h5 class="card-title"> <i class="fa fa-exclamation-triangle text-danger" aria-hidden="true"></i> You are not logged in</h5>
                        <p class="card-text">mPoll uses <a href="https://moralis.io">Moralis</a> for authenticating and signing poll votes so authenticating is mandatory to effectively use the website.</p>

                        <button type="button" class="btn btn-outline-danger" onclick="login();">Log in using Moralis</button>
                    </div>
                </div>`);
    $("#userVote").html(`
                <span class="badge rounded-pill bg-danger"><i class="fa fa-times" aria-hidden="true"></i> Not voted yet | Unauthenticated</span>
                `);


};

addNewPollOption = () => {

    $("#pollOptions").append(
        `
        <div class="input-group mb-3" id="pollOption` + pollOptionCount + `">
                                <span class="input-group-text" id="inputGroup-sizing-default">Poll option ` + pollOptionCount + `</span>
                                <input id="newPollOption` + pollOptionCount + `" type="text" class="form-control" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-default">
                            </div>
        `
    );
    $("#pollOption" + pollOptionCount).hide();
    $("#pollOption" + pollOptionCount).show('slow');
    pollOptionCount++;


}

addNewPollWhitelist = () => {

    $("#pollWhitelists").append(
        `
        <div class="input-group mb-3" id="pollWhitelist` + pollWhitelistCount + `">
                                <span class="input-group-text" id="inputGroup-sizing-default">Poll Whitelisted Address ` + pollWhitelistCount + `</span>
                                <input id="newPollWhitelist` + pollWhitelistCount + `" type="text" class="form-control" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-default" placeholder="0xe3DF2c1b3204bBE31dc9Dcd49EF6AbE8D138b5ea">
                            </div>
        `
    );
    $("#pollOption" + pollWhitelistCount).hide();
    $("#pollOption" + pollWhitelistCount).show('slow');
    pollWhitelistCount++;


}

logout = async() => {
    Moralis.User.logOut().then(() => { window.location.reload(); });
}

populateRecentPolls = async() => {
    const recentPolls = await Moralis.Cloud.run("getRecentPolls");

    recentPolls.forEach((poll) => {
        const pollVisibility = poll.attributes.whitelists[0] != null ? `<span class="badge badge-pill bg-danger">private</span>` : `<span class="badge badge-pill bg-success">public</span>`
        $("#recentlyCreatedPolls").append(`
        <li class="list-group-item  d-flex justify-content-between align-items-start">
            <div class="ms-2 me-auto">
                <div class="fw-bold"><i class="fa fa-poll" aria-hidden="true"></i> <a href="/poll?id=` + poll.id + `">` + poll.id + `</a> ` + pollVisibility + ` </div>
                <i class="fa fa-history" aria-hidden="true"></i> created ` + $.timeago(poll.attributes.createdAt) + `
            </div>
        </li>
                        
        `)
    })
}


createPoll = async() => {

    const balance = await Moralis.Web3API.account.getNativeBalance({ chain: "bsc testnet" });
    const bnbBalance = parseFloat(Web3.utils.fromWei(balance.balance, 'ether').substr(0, 4));


    if (bnbBalance < 1) {
        await Swal.fire({
            icon: 'error',
            title: 'Oops!',
            text: 'You don`t have enough BNB to create a poll!'
        });
        return;
    }

    const user = Moralis.User.current();
    const PollObject = Moralis.Object.extend("Poll");
    const poll = new PollObject();
    const pollOptions = [];
    const pollWhitelists = [];
    for (i = 1; i <= 10; i++) {
        if ($("#newPollOption" + i).val()) pollOptions.push($("#newPollOption" + i).val());
    }
    for (i = 1; i <= 10; i++) {
        if ($("#newPollWhitelist" + i).val()) pollWhitelists.push($("#newPollWhitelist" + i).val());
    }
    if ($("#pollWhitelistCheckbox").prop('checked')) pollWhitelists.push(user.get('ethAddress'));
    console.log(pollOptions);
    console.log(pollWhitelists);
    poll.set("topic", $("#newPollTopic").val());
    poll.set("options", pollOptions);
    poll.set("whitelists", pollWhitelists);
    if ($("#pollMultipleCheckbox").prop('checked')) poll.set("multiple", true);
    else poll.set("multiple", false);

    if (pollWhitelists) poll.set("isWhitelistedPoll", true);
    else poll.set("isWhitelistedPoll", false);

    await poll.save().then(function(data) {
        console.log(data);
        window.location.replace('/poll?id=' + data.id);
    });
}

userSession = async(user) => {
    var userIpJson;

    $.getJSON('https://api.ipify.org?format=json', function(data) {
        userIpJson = data.ip;
    });
    const balance = await Moralis.Web3API.account.getNativeBalance({ chain: "bsc testnet" });
    console.log(balance);
    $("#sessionInfo").html(`
    <div class="card" style="color: black !important;">
                    <div class="card-body">
                        <h5 class="card-title"> <i class="fa fa-check-circle text-success" aria-hidden="true"></i> Connected to Moralis Poll</h5>
                        <span class="card-text"><i class="fas fa-user"></i> <b>Username</b>: ` + user.attributes.username + `</span><br>
                        <span class="card-text"><i class="fas fa-address-book"></i> <b>Wallet</b>: ` + user.attributes.ethAddress + `</span><br>
                        <span class="card-text"><i class="fas fa-coins"></i> <b>Balance</b>: ` + Web3.utils.fromWei(balance.balance, 'ether').substr(0, 4) + `BNB</span><br>
                        <small >No BNB? <a href="#">Visit BNB Facuet</a></small><br>
                        <hr>
                        
                        <span class="card-text"><i class="fa fa-info-circle " aria-hidden="true"></i> You need 0.5BNB+ in your wallet in order to vote in polls</span><br>
                        <span class="card-text"><i class="fa fa-info-circle " aria-hidden="true"></i> You need 1.0BNB+ in your wallet in order to create polls</span><br>
                        
                        
                        <hr>
                        

                        <button type="button" class="btn btn-outline-success" onclick="window.location.replace('/');">Home</button>
                        <button type="button" class="btn btn-outline-danger" onclick="logout();">Log out</button>
                    </div>
                </div>
                `);

    const params = { ip: userIpJson };
    const hasIPVoted = await Moralis.Cloud.run("hasIPVoted", params);

    console.log(hasIPVoted);

    if (hasIPVoted) {
        $("#userVote").html(`
        <span class="badge rounded-pill bg-success"><i class="fa fa-check" aria-hidden="true"></i> Submission voted | Your rating: ` + hasIPVoted + ` <i class="fa fa-star" aria-hidden="true"></i>  </span>
        `);
    } else {
        $("#userVote").html(`
        <span class="badge rounded-pill bg-danger"><i class="fa fa-times" aria-hidden="true"></i> Not voted yet</span>
        <button class="badge rounded-pill bg-warning" style="color: black;" onclick="voteSubmission();" ><i class="fa fa-star " aria-hidden="true"></i> Vote this submission</button>`);
    }


}


voteSubmission = async() => {

    var userIpJson;

    $.getJSON('https://api.ipify.org?format=json', function(data) {
        userIpJson = data.ip;
    });



    const { value: rating } = await Swal.fire({
        title: 'How would you rate this submission?',
        icon: 'question',
        input: 'range',
        html: '<i class="fa fa-star" aria-hidden="true"></i> You can rate this submission from 0 to 5 stars. ',
        inputAttributes: {
            min: 0,
            max: 5,
            step: 0.5
        },
        inputValue: 2.5,
        confirmButtonText: "VOTE"
    });

    const params = { ip: userIpJson };
    const hasIPVoted = await Moralis.Cloud.run("hasIPVoted", params);

    if (hasIPVoted) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'You already voted this submission!',
        })
    } else {
        const user = await Moralis.User.current();
        console.log(user);
        const SubmissionVote = Moralis.Object.extend("SubmissionVote");
        const submissionVote = new SubmissionVote();
        submissionVote.set('vote', rating);
        submissionVote.set('ip', userIpJson);
        submissionVote.save();

        await Swal.fire({
            title: 'Thank you for voting!',
            icon: 'success',
            timer: 2500,
            timerProgressBar: true,
            didOpen: () => {
                Swal.showLoading()
                const b = Swal.getHtmlContainer().querySelector('b')
                timerInterval = setInterval(() => {
                    b.textContent = Swal.getTimerLeft()
                }, 100)
            },
            willClose: () => {
                clearInterval(timerInterval)
            }
        }).then((result) => {
            /* Read more about handling dismissals below */
            if (result.dismiss === Swal.DismissReason.timer) {
                window.location.reload();
            }
        });
    }
}

var userIpJson;

voteOnPoll = async(pollId) => {

    const balance = await Moralis.Web3API.account.getNativeBalance({ chain: "bsc testnet" });
    const bnbBalance = parseFloat(Web3.utils.fromWei(balance.balance, 'ether').substr(0, 4));

    if (bnbBalance < 0.5) {
        await Swal.fire({
            icon: 'error',
            title: 'Oops!',
            text: 'You don`t have enough BNB to vote on this poll!'
        });
        return;
    }

    const canIpVoteOnPoll = await Moralis.Cloud.run("canIpVoteOnPoll", { pollId: pollId, ip: userIpJson });

    if (canIpVoteOnPoll[0]) {
        await Swal.fire({
            icon: 'error',
            title: 'Oops!',
            text: 'You have already voted on this poll!'
        });
        return;
    }

    const user = await Moralis.User.current();
    const userEth = user.get('ethAddress');

    const pollDetails = await Moralis.Cloud.run("getPollDetails", { id: pollId });
    const pollWhitelist = pollDetails[0].attributes.whitelists;

    const uppercasedWL = pollWhitelist.map(name => name.toUpperCase());
    const uppercasedETH = userEth.toUpperCase();


    if (pollWhitelist[0]) {
        if (!uppercasedWL.includes(uppercasedETH)) {
            await Swal.fire({
                icon: 'error',
                title: 'Oops!',
                text: 'You aren`t whitelisted on this poll!'
            });
            return;
        }
    }


    const pollVoteOption = $('input[name="pollVoteOption"]:checked').val();
    const PollVote = Moralis.Object.extend("PollVote");
    const pollVote = new PollVote();
    pollVote.set('pollId', pollId);
    pollVote.set('option', pollVoteOption);
    pollVote.set('ip', userIpJson);
    pollVote.save();

    console.log(pollVote);
    await Swal.fire({
        icon: 'success',
        title: 'Thank you for voting on this poll!',
        html: "Share this poll with your friends: " + "<a href=" + window.location.href + "> " + window.location.href + " </a>"
    })

    window.location.reload();
}

voteOnPollMultiple = async(pollId) => {

    const balance = await Moralis.Web3API.account.getNativeBalance({ chain: "bsc testnet" });
    const bnbBalance = parseFloat(Web3.utils.fromWei(balance.balance, 'ether').substr(0, 4));

    if (bnbBalance < 0.5) {
        await Swal.fire({
            icon: 'error',
            title: 'Oops!',
            text: 'You don`t have enough BNB to vote on this poll!'
        });
        return;
    }

    const canIpVoteOnPoll = await Moralis.Cloud.run("canIpVoteOnPoll", { pollId: pollId, ip: userIpJson });

    if (canIpVoteOnPoll[0]) {
        await Swal.fire({
            icon: 'error',
            title: 'Oops!',
            text: 'You have already voted on this poll!'
        });
        return;
    }

    const user = await Moralis.User.current();
    const userEth = user.get('ethAddress');

    const pollDetails = await Moralis.Cloud.run("getPollDetails", { id: pollId });
    const pollWhitelist = pollDetails[0].attributes.whitelists;

    const uppercasedWL = pollWhitelist.map(name => name.toUpperCase());
    const uppercasedETH = userEth.toUpperCase();


    if (pollWhitelist[0]) {
        if (!uppercasedWL.includes(uppercasedETH)) {
            await Swal.fire({
                icon: 'error',
                title: 'Oops!',
                text: 'You aren`t whitelisted on this poll!'
            });
            return;
        }
    }
    $.each($("input[name='pollVoteOption']:checked"), function() {
        const PollVote = Moralis.Object.extend("PollVote");
        const pollVote = new PollVote();
        pollVote.set('pollId', pollId);
        pollVote.set('option', $(this).val());
        pollVote.set('ip', userIpJson);
        pollVote.save();
    });



    await Swal.fire({
        icon: 'success',
        title: 'Thank you for voting on this poll!',
        html: "Share this poll with your friends: " + "<a href=" + window.location.href + "> " + window.location.href + " </a>"
    })

    window.location.reload();
}

viewPoll = async() => {
    $(document).ready(async function() {

        const user = await Moralis.User.current();
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const pollId = urlParams.get('id');
        const pollDetails = await Moralis.Cloud.run("getPollDetails", { id: pollId });
        const pollVoteDetails = await Moralis.Cloud.run("getPollVoteDetails", { pollId: pollId });
        const votedOption = await Moralis.Cloud.run("getUserVotedOption", { pollId: pollId, ip: userIpJson });

        if (pollDetails[0].attributes.multiple == false) {
            $("#pollDetalis").html(`
        <h1>Poll ID #` + pollId + `</h1>
        <div class="card">
        <div class="card-header">
        Poll detalis
        </div>
        <div class="card-body">
        <div class="input-group mb-3">
        <span class="input-group-text" id="inputGroup-sizing-default">Poll topic</span>
        <input id="newPollTopic" type="text" class="form-control" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-default" style="background-color: white;" readonly value="` + pollDetails[0].attributes.topic + `">
        </div>
        <div id="pollOptions">
        
    
        </div>
            <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                <div id="voteButton"><button class="btn btn-primary me-md-2" type="button" onclick="voteOnPoll('` + pollId + `');">Vote on this poll</button></div>
                </div>
            </div>
        </div>
    
    <div id="miraiScanned" class="mt-3">
    
    
    </div>
    `);

            var optionIndex = 0;

            pollDetails[0].attributes.options.forEach((option) => {
                $("#pollOptions").append(`
    <div class="input-group mb-3">
    <div class="input-group-text">
        <input class="form-check-input mt-0" name="pollVoteOption" id="pollVoteOption` + optionIndex + `" type="radio" value="` + optionIndex + `" aria-label="Radio button for following text input">
      </div>
            <input id="newPollOption1" type="text" class="form-control" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-default" style="background-color: white;" readonly value="` + option + `">
            <span class="input-group-text"><span id="pollOption` + optionIndex + `VoteCount">0</span> votes</span>
        </div>`);
                optionIndex++;
            });

            var pollOption0VoteCount = 0;
            var pollOption1VoteCount = 0;
            var pollOption2VoteCount = 0;
            var pollOption3VoteCount = 0;
            var pollOption4VoteCount = 0;
            var pollOption5VoteCount = 0;
            var pollOption6VoteCount = 0;
            var pollOption7VoteCount = 0;
            var pollOption8VoteCount = 0;
            var pollOption9VoteCount = 0;

            pollVoteDetails.forEach((vote) => {
                if (vote.attributes.option == 0) {
                    pollOption0VoteCount++;
                    $("#pollOption0VoteCount").text(pollOption0VoteCount)
                }
                if (vote.attributes.option == 1) {
                    pollOption1VoteCount++;
                    $("#pollOption1VoteCount").text(pollOption1VoteCount)
                }
                if (vote.attributes.option == 2) {
                    pollOption2VoteCount++;
                    $("#pollOption2VoteCount").text(pollOption2VoteCount)
                }
                if (vote.attributes.option == 3) {
                    pollOption3VoteCount++;
                    $("#pollOption3VoteCount").text(pollOption3VoteCount)
                }
                if (vote.attributes.option == 4) {
                    pollOption4VoteCount++;
                    $("#pollOption4VoteCount").text(pollOption4VoteCount)
                }
                if (vote.attributes.option == 5) {
                    pollOption5VoteCount++;
                    $("#pollOption5VoteCount").text(pollOption5VoteCount)
                }
                if (vote.attributes.option == 6) {
                    pollOption6VoteCount++;
                    $("#pollOption6VoteCount").text(pollOption6VoteCount)
                }
                if (vote.attributes.option == 7) {
                    pollOption7VoteCount++;
                    $("#pollOption7VoteCount").text(pollOption7VoteCount)
                }
                if (vote.attributes.option == 8) {
                    pollOption8VoteCount++;
                    $("#pollOption8VoteCount").text(pollOption8VoteCount)
                }
                if (vote.attributes.option == 9) {
                    pollOption9VoteCount++;
                    $("#pollOption9VoteCount").text(pollOption9VoteCount)
                }

            });

            try {
                if (votedOption) {
                    $("#pollVoteOption" + votedOption[0].attributes.option).prop("checked", true);
                    $("#voteButton").html(`
                <button class="btn btn-success me-md-2" type="button"><i class="fa fa-check" aria-hidden="true"></i> You have already voted</button>`);
                }
            } catch (_) {

            }

            if (!user)
                $("#voteButton").html(`
                <button class="btn btn-danger me-md-2" type="button"><i class="fa fa-times" aria-hidden="true"></i> You have to log in in order to vote</button>`);

        } else {
            console.log('multiple poll');
            $("#pollDetalis").html(`
        <h1>Poll ID #` + pollId + `</h1>
        <div class="card">
        <div class="card-header">
        Poll detalis
        </div>
        <div class="card-body">
        <div class="input-group mb-3">
        <span class="input-group-text" id="inputGroup-sizing-default">Poll topic</span>
        <input id="newPollTopic" type="text" class="form-control" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-default" style="background-color: white;" readonly value="` + pollDetails[0].attributes.topic + `">
        </div>
        <div id="pollOptions">
        
    
        </div>
            <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                <div id="voteButton"><button class="btn btn-primary me-md-2" type="button" onclick="voteOnPollMultiple('` + pollId + `');">Vote on this poll</button></div>
                </div>
            </div>
        </div>
    
    <div id="miraiScanned" class="mt-3">
    
    
    </div>
    `);

            var optionIndex = 0;

            pollDetails[0].attributes.options.forEach((option) => {
                $("#pollOptions").append(`
    <div class="input-group mb-3">
    <div class="input-group-text">
        <input class="form-check-input mt-0" name="pollVoteOption" id="pollVoteOption` + optionIndex + `" type="checkbox" value="` + optionIndex + `" aria-label="Radio button for following text input">
      </div>
            <input id="newPollOption1" type="text" class="form-control" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-default" style="background-color: white;" readonly value="` + option + `">
            <span class="input-group-text"><span id="pollOption` + optionIndex + `VoteCount">0</span> votes</span>
        </div>`);
                optionIndex++;
            });

            var pollOption0VoteCount = 0;
            var pollOption1VoteCount = 0;
            var pollOption2VoteCount = 0;
            var pollOption3VoteCount = 0;
            var pollOption4VoteCount = 0;
            var pollOption5VoteCount = 0;
            var pollOption6VoteCount = 0;
            var pollOption7VoteCount = 0;
            var pollOption8VoteCount = 0;
            var pollOption9VoteCount = 0;

            pollVoteDetails.forEach((vote) => {
                if (vote.attributes.option == 0) {
                    pollOption0VoteCount++;
                    $("#pollOption0VoteCount").html(pollOption0VoteCount + " ")
                }
                if (vote.attributes.option == 1) {
                    pollOption1VoteCount++;
                    $("#pollOption1VoteCount").html(pollOption1VoteCount + " ")
                }
                if (vote.attributes.option == 2) {
                    pollOption2VoteCount++;
                    $("#pollOption2VoteCount").html(pollOption2VoteCount + " ")
                }
                if (vote.attributes.option == 3) {
                    pollOption3VoteCount++;
                    $("#pollOption3VoteCount").html(pollOption3VoteCount + " ")
                }
                if (vote.attributes.option == 4) {
                    pollOption4VoteCount++;
                    $("#pollOption4VoteCount").html(pollOption4VoteCount + " ")
                }
                if (vote.attributes.option == 5) {
                    pollOption5VoteCount++;
                    $("#pollOption5VoteCount").html(pollOption5VoteCount + " ")
                }
                if (vote.attributes.option == 6) {
                    pollOption6VoteCount++;
                    $("#pollOption6VoteCount").html(pollOption6VoteCount + " ")
                }
                if (vote.attributes.option == 7) {
                    pollOption7VoteCount++;
                    $("#pollOption7VoteCount").html(pollOption7VoteCount + " ")
                }
                if (vote.attributes.option == 8) {
                    pollOption8VoteCount++;
                    $("#pollOption8VoteCount").html(pollOption8VoteCount + " ")
                }
                if (vote.attributes.option == 9) {
                    pollOption9VoteCount++;
                    $("#pollOption9VoteCount").html(pollOption9VoteCount + " ")
                }

            });
            console.log('-----');


            try {
                if (votedOption) {
                    votedOption.forEach((option) => {
                        console.log(option);
                        $("#pollVoteOption" + option.attributes.option).prop("checked", true);
                        $("#pollVoteOption" + option.attributes.option).prop("disabled", true);
                        $("#voteButton").html(`
                <button class="btn btn-success me-md-2" type="button"><i class="fa fa-check" aria-hidden="true"></i> You have already voted</button>`);
                    });

                }
                $("#pollVoteOption" + option.attributes.option).prop("disabled", false);
            } catch (_) {

            }

            if (!user)
                $("#voteButton").html(`
                <button class="btn btn-danger me-md-2" type="button"><i class="fa fa-times" aria-hidden="true"></i> You have to log in in order to vote</button>`);

        }

    });



}

init = async() => {
    window.web3 = await Moralis.Web3.enable();
    userNoSession();
    initUser();
    populateRecentPolls();
    $("#whitelistScaffold").hide();
    $("#timelimitScaffold").hide();
    $.getJSON('https://api.ipify.org?format=json', function(data) {
        userIpJson = data.ip;
    });



    const submissionScore = await Moralis.Cloud.run("getSubmissionScore").then(function(value) {
        var totalRatingCount = 0;
        var totalRating = 0;
        var averageRating = 0;
        value.forEach((vote) => {
            totalRating = eval(totalRating + parseFloat(vote.attributes.vote));
            totalRatingCount++;
        });


        averageRating = eval(totalRating / totalRatingCount);

        $("#submissionAvg").text(averageRating.toFixed(2));
        $("#submissionVoteCount").text(totalRatingCount);
    });

};

login = async() => {
    try {
        const user = await Moralis.Web3.authenticate();
        console.log(user);
        userSession(user);
        window.location.reload();
    } catch (error) {
        console.log("AUTH ERROR");
    }
    console.log("authentication success! hooked into");
};

initUser = async() => {
    const user = await Moralis.User.current();
    if (!user) {
        try {
            const user = await Moralis.Web3.authenticate();
            userSession(user);
        } catch (error) {
            console.log(error);
        }
    } else {
        userSession(user);
    }
};

init();

$(document).ready(function() {

    console.log("DOM SUCCESSFULLY LOADED");
    $("#pollWhitelistCheckbox").change(function() {
        if (this.checked)
            $("#whitelistScaffold").show('slow');
        else
            $("#whitelistScaffold").hide('slow');
    });

});