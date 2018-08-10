
App = {
    web3Provider: null,
    contracts: {},
    account: 0x0,
    loading: false,
    symbol: "",
    tknContractAddress: "0x8c595af232bae8f66911f4cbd30f113df928d128",
    POCContractAddress: "0x7f863db7f044f6c96680bb966c652ce6d5b336f3",
    addressToVendor: {"0x52c3a9b0f293cac8c1baabe5b62524a71211a616": "Delhi Police - Crime Branch", 
                      "0x32168f7c3aa5f3ea4fd22e5e0b625f3c3ee0b7bb": "Federal Bureau of Investigation" },
    tips: {},

    init: function() {
        return App.initWeb3();
    },

    initWeb3: function() {
        // Initialize web3 and set the provider to the testRPC.
        if (typeof web3 !== 'undefined') {
            
            // will autodetect if the "ethereum" object is present and will either connect to the local swarm node, or the swarm-gateways.net.
            // Optional you can give your own provider URL; If no provider URL is given it will use "http://swarm-gateways.net"
            App.web3Provider = web3.currentProvider;
            web3 = new Web3(web3.currentProvider);
            //Bzz = require('web3/buzz');
            //bzz = new Bzz('http://localhost:8500');
            // // change provider
            //bzz.setProvider('http://swarm-gateways.net');
        } else {
            // set the provider you want from Web3.providers
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
            web3 = new Web3(App.web3Provider);
        }
        App.displayTokenBal();
        //App.listenToEvents();
        App.getAllTips(App.account);
        App.getAllBounties(App.account);
        // web3.bzz.upload("/Users/quanon/Desktop/anonymous.png", function(err, hash){
        //         console.log("Uploaded :" , hash, err);
        //     })
        return 0;

    },

   uploadToSwarm: function() {
      var file    = document.querySelector('input[type=file]').files[0];
      var reader  = new FileReader();

      reader.addEventListener("load", function () {
        //preview.src = reader.result;
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "http://swarm-gateways.net/bzz:/", true);
        xhr.setRequestHeader('Content-Type', 'text/plain');
        xhr.send(reader.result);
        xhr.onload = function() {
          hash = this.responseText;
          console.log(hash);
        }
      }, false);

      if (file) {
        reader.readAsDataURL(file);
      }
    },

    previewHash: function(hash){
        var preview = document.querySelector('img');
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
               // Typical action to be performed when the document is ready:
                preview.src = xhttp.responseText;
            }
        };
        xhttp.open("GET", "http://swarm-gateways.net/bzz:/" + hash, true);
        xhttp.send();
    },

    displayAccountInfo: function() {
        web3.eth.getCoinbase(function(err, account) {
            if (err == null) {
                App.account = account;
                $("#account").text(account);
                web3.eth.getBalance(account, function(err, balance) {
                    if (err == null) {
                        $("#accountBalance").text(web3.fromWei(balance, "ether") + " ETH");
                    }
                });
            }
        });

    },


    displayTokenBal: function () {
        $.getJSON("abi.json", function(json) {
            var ZTipsTokenContract = web3.eth.contract(json);
            var ZTCInstance = ZTipsTokenContract.at(App.tknContractAddress);
            web3.eth.getCoinbase(function (err, account) {
                if (err == null) {
                    App.account = account;
                    $("#account").text(account);
                    ZTCInstance.balanceOf(account, function (err, result) {
                        if (err == null) {
                            ZTCInstance.symbol(function (err, result2) {
                                if (err == null) {
                                    $("#accountBalance").text((Number.parseFloat(result["c"][0] / 1e4).toFixed(3)) + " " + result2);
                                    App.symbol = result2.toString().slice();
                                    // console.log("UserAccount is: ", account, 'balance is ', result, result2);
                                }
                            });
                        }
                    });
                }
            });
        });
    },




    getAllBounties: function(address) {
        $.getJSON("abipoc.json", function(json) {
            var ZTipsPOCContract = web3.eth.contract(json);
            var ZTCInstance = ZTipsPOCContract.at(App.POCContractAddress);

            ZTCInstance.getBountyCount(function (err, result) {
                if (err) {
                    console.log(err);
                } else {
                    // console.log('result is ', result.c[0]);
                    // clear list of bounties from UI
                    //TODO clear list
                    //loop over all bounties and display them in ui
                    for (var i = 0; i < result.c[0]; i++) {
                        const x = i + 1;
                        ZTCInstance.bounties(i, function(err, bounty){
                        if (err) {
                            console.log(err);
                        } else {
                            // result is the bounty info
                            // create a bounty(UI representation) and add it to list in UI
                            // console.log(bounty);
                            var newBounty = bounty[0].slice(2).split(":.:");
                            // console.log('tokens ' + Number.parseFloat(bounty[3].c / 1e4).toFixed(3));
                            ZTCInstance.bountyToOwner(x, function (err, host) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    fillBounties(newBounty[0] , newBounty[1], Number.parseFloat(bounty[3].c / 1e4).toFixed(3), host, newBounty[2].replace(/&,/g, " "), newBounty[3].split("&,"), x);
                                    // console.log(newBounty);

                                }
                            });
                            }    
                        });
                    }
                }
            });
        });
    },

    getAllTips: function(address) {
        $.getJSON("abipoc.json", function(json) {
            var ZTipsPOCContract = web3.eth.contract(json);
            var ZTCInstance = ZTipsPOCContract.at(App.POCContractAddress);

            ZTCInstance.getTipCount(function (err, result) {
                if (err) {
                    console.log(err);
                } else {
                    // clear list of bounties from UI
                    //TODO clear list
                    //loop over all bounties and display them in ui
                    for (var i = 0; i < result.c[0]; i++) {
                        const x = i ;
                        ZTCInstance.tips(x, function(err, tip){
                        if (err) {
                            console.log(err);
                        } else {
                            // result is the bounty info
                            // create a bounty(UI representation) and add it to list in UI
                            var desc = tip[0];
                            // if (type(desc) != String):
                            //     desc = web3.toAscii(desc);
                            var tipState = tip[1].c;
                            var pubPrivate = tip[2];
                            var ipfsHash = tip[3];
                            var bountyID = tip[4].c;
                            // console.log(
                            //     'owner ' + owner + 'tipstate ' + tipState
                            //     + ' pub? ' +pubPrivate + ' ipfshash '+ ipfsHash +
                            //     'bountyID ' + bountyID);
                            ZTCInstance.tipToOwner(x, function (err, owner) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    // console.log(">>>" + desc);
                                    var dct = {
                                        "owner": owner.toString(),
                                        "tipState": tipState.toString(),
                                        "pubPrivate": pubPrivate.toString(),
                                        "ipfsHash": ipfsHash.toString(),
                                        "description": desc.toString(),
                                    };
                                    App.tips[bountyID] =  dct;

                                }
                            });
                            }    
                        });
                    }
                }
            });
        });
    },

    displayArticle: function(id, seller, name, description, price) {
        // Retrieve the article placeholder
        var articlesRow = $('#articlesRow');

        var etherPrice = web3.fromWei(price, "ether");

        // Retrieve and fill the article template
        var articleTemplate = $('#articleTemplate');
        articleTemplate.find('.panel-title').text(name);
        articleTemplate.find('.article-description').text(description);
        articleTemplate.find('.article-price').text(etherPrice + " ETH");
        articleTemplate.find('.btn-buy').attr('data-id', id);
        articleTemplate.find('.btn-buy').attr('data-value', etherPrice);

        // seller?
        if (seller == App.account) {
            articleTemplate.find('.article-seller').text("You");
            articleTemplate.find('.btn-buy').hide();
        } else {
            articleTemplate.find('.article-seller').text(seller);
            articleTemplate.find('.btn-buy').show();
        }

        // add this new article
        articlesRow.append(articleTemplate.html());
    },



    // create a bounty

    createBounty: function() {
        // create a bounty
        var _generaldetails = $("#bounty_title").val();
        var _description = $("#bounty_description").val();
        var _tokenamount = parseInt($("#bounty_amount").val());
        var _tags = $("#bounty_tags").val().replace(/ /g, "&,");
        var _BountyCondition1 = $("#BountyCondition1").val();
        var _BountyConditionPercentage1 = $("#BountyConditionPercentage1").val();
        var _BountyCondition2 = $("#BountyCondition2").val();
        var _BountyConditionPercentage2 = $("#BountyConditionPercentage2").val();
        var _BountyCondition3 = $("#BountyCondition3").val();
        var _BountyConditionPercentage3 = $("#BountyConditionPercentage3").val();
        var a = '&,';
        var _BountyConditions = _BountyCondition1+a+_BountyConditionPercentage1+a+_BountyCondition2+a+_BountyConditionPercentage2+a+_BountyCondition3+a+_BountyConditionPercentage3;

            if (_BountyCondition1 == undefined) 
                _BountyCondition1 = '';
            if (_BountyConditionPercentage1 == undefined)
                _BountyConditionPercentage1 = '';
            if (_BountyCondition2 == undefined)
                _BountyCondition2 = '';
            if (_BountyConditionPercentage2 == undefined)
                _BountyConditionPercentage2 = '';
            if (_BountyCondition3 == undefined)
                _BountyCondition3 = '';
            if (_BountyConditionPercentage3 == undefined)
                _BountyConditionPercentage3 = '';

        console.log(_generaldetails, _description, _tokenamount, _tags, _BountyConditions);//, _conditions);
        // return


        $.getJSON("abi.json", function(json) {
            var ZTipsTokenContract = web3.eth.contract(json);
            var ZTCInstance = ZTipsTokenContract.at(App.tknContractAddress);
            var _spender = App.POCContractAddress;
            //"bori,description,title,tags,conditions"
            //TODO FIX THIS tags ancd conditions
            var description = "b," + _generaldetails.toString() + ":.:" + _description.toString() + ":.:" + _tags.toString() + ":.:" + _BountyConditions;
            ZTCInstance.approveAndCall(_spender, (_tokenamount * (10**18)), description, function (err, result) {
                console.log(err);
                console.log(result);
            });
        });

    },

    // Listen for events raised from the contract
    listenToEvents: function() {
        $.getJSON("abi.json", function(json) {
            var ZTipsTokenContract = web3.eth.contract(json);
            var ZTCInstance = ZTipsTokenContract.at(App.tknContractAddress);
            ZTCInstance.NewBounty().watch(
                function(err, result){
                    console.log('on_watch');
                    console.log(arguments);
                });
        });
    },


    createTip: function(_bountyID, placeTipNum) {
        // create a bounty

        console.log(_bountyID);
        var _1placeTip = $("#1placeTipCondition"+placeTipNum).val();
        var _2placeTip = $("#2placeTipCondition"+placeTipNum).val();
        var _3placeTip = $("#3placeTipCondition"+placeTipNum).val();
        var _placeTip = $("#placeTipInformation"+placeTipNum).val();
        var _tokenamount = 1;

        // console.log(_generaldetails, _description, _tokenamount);


        $.getJSON("abi.json", function(json) {
            var ZTipsTokenContract = web3.eth.contract(json);
            var ZTCInstance = ZTipsTokenContract.at(App.tknContractAddress);
            var _spender = App.POCContractAddress;
            //"bori,description,title,tags,conditions"
            //TODO FIX THIS tags ancd conditions
            var description = _bountyID + "," + _1placeTip.toString() + ":.:" + _2placeTip.toString() + ":.:" + _3placeTip.toString() + ":.:" + _placeTip.toString();
            //console.log(description);

            ZTCInstance.approveAndCall(_spender, (_tokenamount * (10**18)), description, function (err, result) {
                console.log(err);
                console.log(result);
            });
        });

    },
};

$(function() {
    $(window).load(function() {
        App.init();
    });
});



    function fillBounties(title,detail,amount,host,tags,conditions,bountyID) {
        placeTipNumbers++;

        var a1 = '<div class="col-sm-4" style="padding-bottom: 10px;"><div class="card" style="padding: 10px; border: grey solid 1px; border-radius: 4px;"><div class="card-block"><h3 class="card-title">';
        var a2 = '</h3><p class="card-text"><input type="text" name="host" hidden>';
        var a3 = '.</h3><p class="card-text"><input type="text" name="host" hidden>';
        var a4 = '<br></p><button type="button" class="btn btn-secondary bounty_btn btn btn-primary" data-toggle="modal" data-target="#placeTip'; 
        var a5 ='">Bounty: ';
        var a6 = ' ' + App.symbol + ' </button><div class="modal fade" id="placeTip';
        var a7 = '" role="dialog"> <div class="modal-dialog"> <div class="modal-content"> <div class="modal-header"> <button type="button" class="close" data-dismiss="modal">&times;</button> <h4 align="center" class="modal-title">';
        var a8 = '</h4> </div> <div class="modal-body"> <div class="row"> <div class="col-lg-12"> <form>  <div class="details"> <label for="example-text-input" class="col-2 col-form-label">Details : ';
        var a9 = '';
        var a10 = '<br><label for="example-text-input" class="col-2 col-form-label">Tags : ';
        var a11 = '</label> </div> <div class="row"> <div class="col-md-12 col-xs12"> <div style=" display: inline-block;"><h5><b>Amount of ZTPS for Bounty Reward : ';
        var a12 = ' </b> </h5></div> <br><label for="info_description">Condition 1: ';
        var a13 = '</label><textarea type="text" class="form-control vresize" placeholder="Condition 1" id="1placeTipCondition " rows="1"></textarea><form action=""><input type="file" name="file" accept="*"></form>';
        var a14 = '<br><label for="info_description">Condition 2: ';
        var a15 = '</label><textarea type="text" placeholder="Condition 2" class="form-control vresize" id="2placeTipCondition" rows="1"></textarea><form action=""><input type="file" name="file" accept="*"></form>';
        var a16 = '<br><label for="info_description">Condition 3: ';
        var a17 = '</label><textarea type="text" class="form-control vresize" placeholder="Condition 3" id="3placeTipCondition" rows="1"></textarea><form action=""><input type="file" name="file" accept="*"></form>';
        var a18 = '';
        var a19 = '<div style="display: inline-block;" id="reward_value"></div> </div> </div> <div class="form-group"> <label for="info_description">Information/Tip :';
        var a20 = '(Max. 500 words)</label> <textarea type="text" class="form-control vresize" id="placeTipInformation" placeholder="Information" rows="6"></textarea> </div> </form>';
        var a21 = ' </div> </div> </div> <div class="modal-footer"><p><font size="3" color="red">Warning: It will cost you 1 ZTPS!</font></p> <button type="button" id="submit_information_to_blockchain" class="btn btn-primary btn-success" data-dismiss="modal" onclick="App.createTip(); return false;">Submit</button> <button type="button" class="btn" data-dismiss="modal">Close</button> </div> </div> </div> </div>';
        var b1 = ' | '; 
        var b2 = ' % ' + App.symbol;
        var pt = placeTipNumbers;
        var c1 = bountyID + ',' + pt;

        
        try {
            var tipDetails = App.tips[bountyID];
            console.log(tipDetails);
            if (App.account == host) {
                var descriptions = tipDetails['description'];
                descriptions = descriptions.slice(2, descriptions.length);
                // descriptions = descriptions.replace(":.:", ",");
                descriptions = descriptions.split(":.:");
                console.log(descriptions);
                a13 = '</label><br> Tip: '+ descriptions[0].toString() + '</label>';
                a15 = '</label><br> Tip: ' + descriptions[1].toString() + '</label>';
                a17 = '</label><br> Tip: ' + descriptions[2].toString() + '</label>';
                a20 = '</label><br> Tip: ' + descriptions[3].toString() + '</label>';
                a21 = ' </div> </div> </div> <div class="modal-footer"> <button type="button" id="accept_bounty" class="btn btn-primary btn-success" data-dismiss="modal" onclick="App.acceptTip(); return false;">Accept</button> <button type="button" class="btn" data-dismiss="modal">Reject</button> </div> </div> </div> </div>';
                c1 = pt = '';
            }
        } catch (err){
            // console.log("");
            // console.log("no tips for this bounty yet " + title);
            // console.log("err: " + err);
        }

        //if bounty owner is web3.coinbase and tipdetails is empty then return

        // if tipDetails not empty display tip details below
        var addr = host;
        try {
            host = App.addressToVendor[addr.toString()];
        }catch(err){
            host = addr;
        }

         var cardTemplate = a1+title+a2+detail+a3+host+a4+placeTipNumbers+a5+amount+a6+placeTipNumbers+a7+title+a8+detail+a9+a10+tags+a11+amount+a12+conditions[0]+b1+conditions[1]+b2+a13+pt+a14+conditions[2]+b1+conditions[3]+b2+a15+pt+a16+conditions[4]+b1+conditions[5]+b2+a17+pt+a18+a19+pt+a20+c1+a21;

        var mydiv = document.getElementById("bounty_row");
        var newDiv = document.createElement('div');
        newDiv.innerHTML = cardTemplate;

        while (newDiv.firstChild) {
            mydiv.appendChild(newDiv.firstChild);
        }               
    }