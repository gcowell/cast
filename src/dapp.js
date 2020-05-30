var Web3 = require("web3");
var contract = require("truffle-contract");
const swarm = require("swarm-js").at("http://localhost:8500");
const Quill = require("quill");
require("bootstrap");


//CONTRACTS
var User = contract(require("../build/contracts/User.json"));
var ArticleContract = contract(require('../build/contracts/Article.json'));

var account;


window.Dapp =
{
//--------------------------------------------------------------------------------------------------------------
    init: function(mode)
    {

        this.cacheDOM();
        this.bindEvents();
        this.renderArticleQuill(this.mainEditorContainerID);

        //DEFAULT PROPOSAL BUTTON TO HIDDEN UNTIL PROPOSAL IS SUBMITTED
        this.$myProposalsButton.hide();

        this.proposalArray = [];
        this.activeMarkers = [];
        this.votes = [];
        this.voteStake = 4; //TODO MAKE DYNAMIC

    },


//--------------------------------------------------------------------------------------------------------------

    bindEvents: function()
    {

        this.$uploadButton.on('click', this.submitArticle.bind(this));

        //TODO - REPLACE WHEN BC
        this.$getReviewButton.on('click', this.getArticle.bind(this));
        this.$testButton.on('click', this.renderFullArticle.bind(this));
        this.$proposeChangesButton.on('click', this.bindProposalFunctionality.bind(this));

        this.$proposalSidebarCloseButton.on('click', this.closeProposalSideBar.bind(this));
        this.$votingSidebarCloseButton.on('click', this.activateReviewMode.bind(this));

        this.$submitProposalsButton.on('click', this.submitProposals.bind(this));
        this.$myProposalsButton.on('click', this.openProposalSideBar.bind(this));
        this.$closeProposalOverlays.on('click', this.bindCloseProposalOverlayFunctionality.bind(this));
        this.$votingSubmitButton.on('click', this.bindVoteSubmissionFunctionality.bind(this));

        this.$rejectButton.on('click', this.bindRejectVoteFunctionality.bind(this));
        this.$acceptButton.on('click', this.bindAcceptVoteFunctionality.bind(this));


        //TABS
        this.$reviewTab.on('click', this.activateReviewMode.bind(this));
        this.$votingTab.on('click', this.activateVotingMode.bind(this));

        //RESIZE EVENT HANDLER
        var resizeId;
        $(window).resize(function() {
            clearTimeout(resizeId);
            resizeId = setTimeout(this.repositionMarkers.bind(this), 400);
        }.bind(this));
    },


//--------------------------------------------------------------------------------------------------------------

    cacheDOM: function()
    {
        this.$body = $('body');
        this.$mainEditorContainer = $('#editor-container');
        this.mainEditorContainerID = '#'+this.$mainEditorContainer.attr('id');
        this.$mainContent = $('#main');

        this.$uploadButton = $('#uploadButton');
        this.$getReviewButton = $('#reviewButton');
        this.$token = $( "input[name='_token']").val();

        //REVIEW BUTTONS
        this.$proposeChangesButton = $('#proposeChangesButton');
        this.$rejectButton = $('#rejectButton');
        this.$acceptButton = $('#acceptButton');

        //TODO - REPLACE WHEN BC
        this.$testButton = $('#testRendering');


        //POPOVERS
        this.$changePopover = $('#changePopover');
        this.$addPopover = $('#addPopover');

        //POPOVER BUTTONS
        this.$proposeToAddButton = $('#proposeToAddButton');
        this.$proposeToReplaceButton = $('#proposeToReplaceButton');
        this.$proposeToRemoveButton = $('#proposeToRemoveButton');

        //PROPOSAL SIDEBAR
        this.$proposalSidebar = $('#proposalSidebar');
        this.$proposalSidebarCloseButton = $('#proposalSidebarCloseButton');
        this.$submitProposalsButton = $('#submitProposalsButton');


        //VOTING SIDEBAR
        this.$votingSidebar = $('#votingSidebar');
        this.$votingSidebarCloseButton = $('#votingSidebarCloseButton');
        this.$votingSubmitButton = $('#voteSubmitButton');
        this.$voteSummary = $('#voteSummary');


        this.$myProposalsButton = $('#stickyProposals');

        this.$closeProposalOverlays = $('.proposalClose');

        //TABS
        this.$reviewTab = $('#reviewTab');
        this.$votingTab = $('#votingTab');


    },

//--------------------------------------------------------------------------------------------------------------
    renderArticleQuill: function(editorContainerID)
    {
        //ARTICLE QUILL EDITOR
        this.articleQuill = new Quill(editorContainerID, {
            modules: {
                toolbar: [
                    [{ header: [1, 2, false] }],
                    ['bold', 'italic', 'underline'],
                    ['image', 'code-block']
                ]
            },
            placeholder: 'Lets get busy',
            theme: 'snow'
        });

    },

//--------------------------------------------------------------------------------------------------------------
    renderOriginalWordingQuill: function(editorContainerID)
    {

        //GENERATES MINI QUILL FOR SIDEBAR
        var originalWordingQuill = new Quill(editorContainerID, {
            theme: 'bubble'
        });

        return originalWordingQuill;

    },


//--------------------------------------------------------------------------------------------------------------

    renderProposedWordingQuill: function(editorContainerID)
    {

        //GENERATES MINI QUILL FOR SIDEBAR (FOR PROPOSAL COMPILATION)
        var proposedWordingQuill = new Quill(editorContainerID, {
            modules: {
                toolbar: [
                    [{ header: [1, 2, false] }],
                    ['bold', 'italic', 'underline'],
                    ['image', 'code-block']
                ]
            },
            placeholder: 'Proposal...',
            theme: 'snow'
        });

        return proposedWordingQuill;

    },

//--------------------------------------------------------------------------------------------------------------

    renderJustificationQuill: function(editorContainerID)
    {

        //GENERATES MINI QUILL FOR SIDEBAR (FOR JUSTIFICATION COMPILATION)
        var justificationQuill = new Quill(editorContainerID, {
            placeholder: 'Justification...',
            theme: 'bubble'  // or 'bubble'
        });

        return justificationQuill;

    },

//--------------------------------------------------------------------------------------------------------------

    bindRejectVoteFunctionality: async function()
    {

        var input = $('#hashInput');
        var articleHash = input.val();

        var instance = await ArticleContract.deployed();
        var contractUpdate = await instance.addDownVote(articleHash, {from: account});

    },

    //--------------------------------------------------------------------------------------------------------------

    bindAcceptVoteFunctionality: async function()
    {
        var input = $('#hashInput');
        var articleHash = input.val();

        var instance = await ArticleContract.deployed();
        var contractUpdate = await instance.addUpVote(articleHash, {from: account});

    },

//--------------------------------------------------------------------------------------------------------------

    submitArticle: async function()
    {
        //RECORD DELTA OF INITIAL ARTICLE
        var initialDelta = JSON.stringify(this.articleQuill.getContents());

        var swarmHash = await swarm.upload(initialDelta);
        var instance = await ArticleContract.deployed();
        var contractUpdate = await instance.uploadArticle(swarmHash, 'Trump is cool', {from: account});

        await console.log('Uploaded to: ' + swarmHash);

        //Then forward somewhere


    },


//--------------------------------------------------------------------------------------------------------------

    getArticle: async function()
    {
        //TODO - NEEDS TO BE DYNAMIC
        var input = $('#hashInput');
        var articleLocation = input.val();


        var instance = await ArticleContract.deployed();
        var articleContractData = await instance.getOriginalArticle.call(articleLocation, {from: account});
        var swarmHash = await articleContractData[2];
        var swarmData = await swarm.download(swarmHash);
        var stringifiedDelta = await swarm.toString(swarmData);

        await console.log(articleContractData);
        await console.log(articleContractData[3].toNumber());
        await console.log(articleContractData[4].toNumber());


        var articleDelta = await JSON.parse(stringifiedDelta);
        this.articleQuill.setContents(articleDelta);
        this.articleQuill.disable();

    },


//--------------------------------------------------------------------------------------------------------------

    bindProposalFunctionality: function()
    {
        //WHEN TEXT SELECTION IS ADDED, OPEN PROPOSAL INTERFACE
        this.articleQuill.on('selection-change', function(range, oldRange, source)
        {

            //IF POPOVER IS VISIBLE, DO NOTHING ON SELECTION CHANGE
            if (this.$addPopover.is(':visible') || this.$changePopover.is(':visible'))
            {
                return;
            }
            else
            {
                var newProposal =
                {
                    'range' : range
                };

                var overlappingProposals = this.checkForRangeOverlaps(newProposal, this.proposalArray);

                if(overlappingProposals.length)
                {
                    alert('This proposal overlaps with an existing one');
                    this.unbindProposalFunctionality();
                    return;
                }

                var marker = this.generateOverlayMarker(range, 'newMarker');

                if (range) {
                    //IF NO SELECTION, USER INTENTION IS TO ADD CONTENT AT LOCATION
                    if (range.length == 0)
                    {
                        var type = 'add';
                        this.$addPopover.show();
                        this.$changePopover.hide();

                        this.$proposeToAddButton.off();
                        this.$proposeToAddButton.on('click', this.createNewProposal.bind(this, range, marker, type));

                        var addpopoverHeight = this.$addPopover.height();
                        this.$addPopover.css('left', (window.x + 10) + 'px');
                        this.$addPopover.css('top', (window.y - (addpopoverHeight/2)-10) + 'px');
                    }
                    else
                    {
                        //OTHERWISE, USER HAS SELECTED TEXT TO REPLACE OR REMOVE
                        this.$changePopover.show();
                        this.$addPopover.hide();

                        //REPLACE
                        this.$proposeToReplaceButton.off();
                        this.$proposeToReplaceButton.on('click', this.createNewProposal.bind(this, range, marker, 'replace'));

                        //REMOVE
                        this.$proposeToRemoveButton.off();
                        this.$proposeToRemoveButton.on('click', this.createNewProposal.bind(this, range, marker, 'remove'));

                        //POPOVER POSITIONING
                        var popoverHeight = this.$changePopover.height();
                        this.$changePopover.css('left', (window.x + 10) + 'px');
                        this.$changePopover.css('top', (window.y - (popoverHeight/2)-10) + 'px');
                    }
                }
                else
                {
                    this.$changePopover.hide();
                    this.$addPopover.hide();

                }
            }
        }.bind(this));
    },

//--------------------------------------------------------------------------------------------------------------

    bindCloseProposalOverlayFunctionality: function()
    {
        this.$addPopover.hide();
        this.$changePopover.hide();
        this.$mainEditorContainer.find( "[data-marker-confirmed='false']").hide();
    },


//--------------------------------------------------------------------------------------------------------------

    recordActiveMarkers: function(identifier, type, range, marker)
    {
        this.activeMarkers[identifier] =
        {
            type: type,
            range: range,
            marker: marker
        };
    },


//--------------------------------------------------------------------------------------------------------------


    generateOverlayMarker: function(range, markerType, proposalIdentifier)
    {
        //CREATE UNIQUE IDENTIFIER FOR SELECTION - WILL BE LINKED TO PROPOSAL WHEN CREATED
        if (markerType === 'newMarker' && !proposalIdentifier)
        {
            proposalIdentifier = Math.random().toString(36).substring(7);
        }

        var markerElementParent = $('<div/>', {
            class: 'overlayMarker' + '-' + markerType,
            id: markerType + '-' + proposalIdentifier
        });

        //MARKER NOT YET LINKED TO ACTIVE PROPOSAL
        markerElementParent.attr('data-marker-confirmed', 'false');
        markerElementParent.css('pointer-events', 'none');

        this.configureMarkerPosition(markerElementParent, range);

        markerElementParent.appendTo(this.$mainEditorContainer);

        this.recordActiveMarkers(proposalIdentifier, 'new', range, markerElementParent)

        return markerElementParent;
    },

//--------------------------------------------------------------------------------------------------------------


    configureMarkerPosition: function(markerElementParent, range)
    {

        //INITIAL BOUNDS FOR FIRST CHARACTER IN SELECTION
        var initialStepBounds = this.articleQuill.getBounds(range.index);
        var initialTop = initialStepBounds.top;
        var initialLeft = initialStepBounds.left;
        var initialLineHeight = initialStepBounds.bottom - initialTop;


        //CREATE INITIAL MARKER
        var initialMarkerElement = $('<div/>',
            {
                class: 'initialMarker'
            });


        //SIZE AND POSITION
        initialMarkerElement.css('left', initialLeft);
        initialMarkerElement.css('top', initialTop);
        initialMarkerElement.css('height', initialLineHeight + 'px');

        //ALLOW MARKER TO BE TRANSPARENT
        initialMarkerElement.css('position', 'absolute');
        initialMarkerElement.css('display', 'block');
        initialMarkerElement.css('z-index', '1059');
        initialMarkerElement.css('background', 'red');
        initialMarkerElement.css('opacity', '0.6');

        //APPEND INITIAL MARKER TO PARENT CONTAINER
        initialMarkerElement.appendTo(markerElementParent);

        //IF NO SELECTION, GIVE MARKER ARBITRARY NON ZERO WIDTH
        if(range.length == 0)
        {
            initialMarkerElement.css('width', '2px');
        }
        else
        {
            //IF SELECTION HAS LENGTH, ITERATE ALONG LINES

            //INSTANTIATE VARIABLES FOR CHARACTER STEPS
            var currentStepBounds;
            var currentTop;
            var currentLineHeight;
            var currentLineLeft = initialLeft;
            var currentElement = initialMarkerElement;

            var prevTop = initialTop;
            var prevLineHeight = initialLineHeight;

            var markerWidth;


            for (var pos = range.index; pos <= (range.index + range.length); pos++ )
            {

                //GET BOUNDS OF CURRENT CHARACTER
                currentStepBounds = this.articleQuill.getBounds(pos);
                currentTop = currentStepBounds.top;
                currentLineHeight = currentStepBounds.bottom - currentTop;

                //IF TOP POSITIONS DO NOT MATCH, A NEW MARKER IS REQUIRED FOR A NEW LINE
                if (currentTop !== prevTop)
                {

                    //CREATE NEW ELEMENT
                    var newElement = $('<div/>',
                        {
                            class: 'supplementalMarker'
                        });

                    //SIZE AND POSITION NEW LINE MARKER
                    newElement.css('top', currentTop);
                    newElement.css('left', currentStepBounds.left);
                    newElement.css('height', currentLineHeight + 'px');

                    //APPLY GENERIC CSS
                    newElement.css('position', 'absolute');
                    newElement.css('display', 'block');
                    newElement.css('z-index', '1059');
                    newElement.css('background', 'red');
                    newElement.css('opacity', '0.6');

                    //APPEND TO NEW PARENT ELEMENT
                    newElement.appendTo(markerElementParent);

                    //SET NEW PREVIOUS VALUES
                    prevTop = currentTop;
                    prevLineHeight = currentLineHeight;

                    currentLineLeft = currentStepBounds.left;
                    currentElement = newElement;
                }
                else
                {
                    //GROW MARKER WIDTH ALONG THE LINE
                    markerWidth =  currentStepBounds.right - currentLineLeft;
                    currentElement.css('width', markerWidth + 'px');
                }
            }
        }
    },

    //--------------------------------------------------------------------------------------------------------------


    repositionMarkers: function()
    {

        var markers = this.activeMarkers;
        var marker;

        for (var markerID in markers)
        {
            if (!markers.hasOwnProperty(markerID))
            {
                continue;
            }

            var markerParentElement = $(markers[markerID].marker);
            var range = markers[markerID].range;

            markerParentElement.children().remove();

            this.configureMarkerPosition(markerParentElement, range);

        }
    },

//--------------------------------------------------------------------------------------------------------------


    unbindProposalFunctionality: function()
    {
        //TURN OFF POPOVERS ON SELECTION CHANGE
        this.articleQuill.off('selection-change');
    },


//--------------------------------------------------------------------------------------------------------------

    createNewProposal: function(range, marker, type)
    {

        //OPEN THE SIDEBAR
        this.openProposalSideBar();

        //HIDE ACTIVE POPOVERS
        this.$changePopover.hide();
        this.$addPopover.hide();

        //GENERATE RANDOM PROPOSAL ID FOR THIS SESSION
        var markerID = marker.attr('id');
        var proposalIdentifier = markerID.replace( "newMarker-", '' );

        //INSTANTIATE NEW PROPOSAL OBJECT
        var newProposal =
        {
            articleID: 2, //TODO - WILL BE DYNAMIC
            range: range,
            justification: null,
            newWording: null,
            originalWording: null,
            type: type,
            quillEditors: null
        };

        //RECORD IN ARRAY
        this.proposalArray[proposalIdentifier] = newProposal;

        this.renderProposalSidebarInterface(proposalIdentifier, range, type);

        //GET THE CONTENTS SELECTED BY THE REVIEWER
        if(type === 'replace' || type === 'remove')
        {
            //GET THE ORIGINAL WORDING
            var originalWording = this.articleQuill.getContents(range.index, range.length);

            //ADD ORIGINAL WORDING TO OBJECT
            this.proposalArray[proposalIdentifier].originalWording = originalWording;

            //DISPLAY THE ORIGINAL WORDING IN THE RELEVANT QUILL EDITOR
            this.proposalArray[proposalIdentifier].quillEditors.originalWordingEditor.setContents(originalWording);
            this.proposalArray[proposalIdentifier].quillEditors.originalWordingEditor.disable();
        }

        //DO NOT ALLOW FURTHER PROPOSALS TO BE TRIGGERED WHILE SIDEBAR IS OPEN
        this.unbindProposalFunctionality();


    },

//--------------------------------------------------------------------------------------------------------------


    openProposalSideBar: function ()
    {
        this.$myProposalsButton.hide();
        this.$proposalSidebar.css("width", "400px");
        this.$mainContent.css("marginLeft", "400px");
    },


//--------------------------------------------------------------------------------------------------------------

    closeProposalSideBar: function ()
    {

        this.$proposalSidebar.css("width", "0px");
        this.$mainContent.css("marginLeft", "auto");

        //COLLAPSE OPEN PROPOSALS
        this.$proposalSidebar.find("[id^='accordion-']").collapse();

        this.$myProposalsButton.show('slow');

    },

//-------------------------------------------------------------------------------------------------------------

    bindProposalReplaceFunctionality: function(radioSelector)
    {
        var removeOption = radioSelector.find('#radioButtonRemove');
        var replaceOption = radioSelector.find('#radioButtonReplace');

        removeOption.on('click', function()
        {
            var proposalContainer = radioSelector.parent('.proposalContainer');

            proposalContainer.find('#saveProposalButton').show();
            proposalContainer.find('#discardProposalButton').show();
            proposalContainer.find('.justificationEditor').show();

            var proposalDeclaration = proposalContainer.find('#proposalDeclaration');

            proposalDeclaration.text('I propose to remove this.');
            proposalDeclaration.show();

            proposalContainer.find('.proposedWordingContainer').hide();

        });

        replaceOption.on('click', function()
        {
            var proposalContainer = radioSelector.parent('.proposalContainer');

            proposalContainer.find('#saveProposalButton').show();
            proposalContainer.find('#discardProposalButton').show();
            proposalContainer.find('.justificationEditor').show();

            proposalContainer.find('.proposedWordingContainer').show();

            var proposalDeclaration = proposalContainer.find('#proposalDeclaration');

            proposalDeclaration.text('I propose to replace this with the following:');
            proposalDeclaration.show();


        });

    },


//--------------------------------------------------------------------------------------------------------------

    bindProposalSaveFunctionality: function(ArticleEditor, saveProposalButton, proposalIdentifier)
    {
        saveProposalButton.on('click', function()
        {

            //GET DOM AND QUILL OBJECTS
            var proposalContainer = $(this).closest('.proposalContainer');
            var proposedWordingQuill = proposalContainer.find('.proposedWordingEditor')[0].__quill;
            var justificationWordingQuill = proposalContainer.find('.justificationEditor')[0].__quill;

            //GET RADIO BUTTONS
            var removeSelector = proposalContainer.find('#radioButtonRemove');
            var replaceSelector = proposalContainer.find('#radioButtonReplace');

            //CHECK RADIO BUTTONS FOR CHANGES TO PROPOSAL TYPE
            if(removeSelector.is(':checked'))
            {
                ArticleEditor.proposalArray[proposalIdentifier].type = 'remove';

            }
            if(replaceSelector.is(':checked'))
            {
                ArticleEditor.proposalArray[proposalIdentifier].type = 'replace';

            }

            //REQUIRE A NEW WORDING IN ALL CASES, EXCEPT REMOVE PROPOSAL
            if(!removeSelector.is(':checked'))
            {
                //CHECK IF PROPOSAL QUILL IS EMPTY
                if(proposedWordingQuill.getText() === '\n')
                {
                    alert('you must insert a proposal');
                    //TODO - CHANGE ALERT TO SOFTER WARNING
                    return false;
                }
                ArticleEditor.proposalArray[proposalIdentifier].newWording = proposedWordingQuill.getContents();
            }

            //CHECK IF JUSTIFICATION QUILL IS EMPTY
            if(justificationWordingQuill.getText() === '\n')
            {
                alert('you must provide a justification');
                //TODO - CHANGE ALERT TO SOFTER WARNING

                return false;
            }

            //RECORD PROPOSALS IN JAVASCRIPT OBJECT WITH UNIQUE IDENTIFIER
            ArticleEditor.proposalArray[proposalIdentifier].justification = justificationWordingQuill.getContents();

            //COLLAPSE THE SIDEBAR ELEMENT
            var panel = $(this).closest("[id^='accordion-']").collapse();


        });
    },

//--------------------------------------------------------------------------------------------------------------

    bindProposalDiscardFunctionality: function(ArticleEditor, discardProposalButton, proposalIdentifier)
    {
        discardProposalButton.on('click', function()
        {
            //GET DOM ELEMENT REPRESENTING ENTIRE PARENT
            var panel = $(this).closest('.panel-group').remove();

            //REMOVE PROPOSAL FROM OBJECT
            delete ArticleEditor.proposalArray[proposalIdentifier];
            ArticleEditor.proposalArray = ArticleEditor.proposalArray.filter(function(n){ return n != null });

            //REMOVE OVERLAY MARKER
            $('#newMarker-' + proposalIdentifier).remove();
            delete ArticleEditor.activeMarkers[proposalIdentifier];
            ArticleEditor.activeMarkers = ArticleEditor.activeMarkers.filter(function(n){ return n != null });

        });
    },


//--------------------------------------------------------------------------------------------------------------

    submitProposals: async function()
    {

        //FOR EACH SAVED PROPOSAL
        for (var proposalIdentifier in this.proposalArray)
        {
            //CHECK IF PROPOSAL EXISTS
            if (!this.proposalArray.hasOwnProperty(proposalIdentifier))
            {
                continue;
            }

            var newWording;
            if(this.proposalArray[proposalIdentifier].newWording !== null )
            {
                //GET INITIAL PROPOSAL INPUT WITH ANNOYING QUILL NEWLINE
                var rawNewWordingText = JSON.stringify(this.proposalArray[proposalIdentifier].newWording);
                //STRIP FINAL TRAILING NEWLINE FROM PROPOSAL
                var endOfText = '"}]}';
                var lastNewLine = rawNewWordingText.lastIndexOf('"}]}')-2;
                var sanitisedNewWording = rawNewWordingText.slice(0,lastNewLine);
                newWording = sanitisedNewWording + endOfText;
            }
            else
            {
                newWording = 'null';
            }
            //GET RANGE AND JUSTIFICATION (NO NEED TO STRIP NEWLINES)
            var range = JSON.stringify(this.proposalArray[proposalIdentifier].range);
            var justification = JSON.stringify(this.proposalArray[proposalIdentifier].justification);
            var originalWording = JSON.stringify(this.proposalArray[proposalIdentifier].originalWording);
            var type = this.proposalArray[proposalIdentifier].type;

            var data = {
                    "_token": this.$token,
                    "newWording": newWording,
                    "originalWording": originalWording,
                    "range": range,
                    "justification": justification,
                    "type": type
                    };




            var swarmHash = await swarm.upload(JSON.stringify(data));
            var instance = await ArticleContract.deployed();
            var contractUpdate = await instance.addProposal(swarmHash, 'ae8029971cab5256891b54cce1aa0ba67172969ff77a2bb85ed4deb62b119064', {from: account});

            //TODO this code should be executed upon a vote being cast. the contract should then check the pass criteria for the proposal and then incoporate or not based upon the new vote.
            var contractApproval = await instance.incorporateProposal(swarmHash, 'ae8029971cab5256891b54cce1aa0ba67172969ff77a2bb85ed4deb62b119064');

            await console.log('Uploaded to: ' + swarmHash);


            //POST TO SERVER
//            $.ajax({
//                type: "POST",
//                url: "http://castdev/proposals/create",
//                data:
//                {
//                    "_token": this.$token,
//                    "newWording": newWording,
//                    "originalWording": originalWording,
//                    "range": range,
//                    "justification": justification,
//                    "type": type
//                },
//                success: (function()
//                {
//                    alert('i am done');
//                    //TODO - REMOVE ALERT
//                }),
//                dataType: "text"
//            });
        }
    },

//--------------------------------------------------------------------------------------------------------------

    renderFullArticle: async function()
    {
        //TODO ID WILL NEED TO BE DYNAMICALLY CHANGED
        var articleID = 1;
        var input = $('#hashInput');
        var articleLocation = input.val();


        var instance = await ArticleContract.deployed();
        var articleContractData = await instance.getOriginalArticle.call(articleLocation, {from: account});
        var swarmHash = await articleContractData[2];
        var swarmData = await swarm.download(swarmHash);
        var stringifiedDelta = await swarm.toString(swarmData);
        this.article = await JSON.parse(stringifiedDelta);


        //////





        //GET THE ORIGINAL ARTICLE
        $.ajax({
            type: "GET",
            url: "http://castdev/articles/review/" + articleID,
            success: (function(data)
            {
                this.article = JSON.parse(data);

                //ONCE ARTICLE HAS BEEN RECEIVED, APPLY ASSOCIATED COMMENTS
                $.ajax({
                    type: "GET",
                    url: "http://castdev/proposals/show",
                    success: (function(data)
                    {

                        this.proposalsToIncorporate = JSON.parse(data);

                        //SORT PROPOSALS BASED UPON THEIR PLACEMENT INDEX IN THE ARTICLE
                        this.proposalsToIncorporate.sort(function(a,b) { return ( (JSON.parse(a.range)).index > (JSON.parse(b.range)).index) ? 1 : (( (JSON.parse(b.range)).index > (JSON.parse(a.range)).index) ? -1 : 0);} );

                        //INSTANTIATE RUNNING OFFSET TO KEEP TRACK OF CURSOR POSITION
                        var runningCharacterOffset = 0;


                        //LOOP THROUGH PROPOSALS
                        var deltaToInsert;
                        var newLength;
                        for (var i = 0; i < this.proposalsToIncorporate.length; i++)
                        {
                            //CAPTURE ARTICLE OPERATIONS IN NEW DELTA OBJECT
                            if (!article)
                            {
                                var article = new Delta(this.article);
                            }

                            var currentProposal = this.proposalsToIncorporate[i];
                            var proposalRange = JSON.parse(currentProposal.range);

                            //CORRECT INDEX BASED UPON CURRENT OFFSET
                            var correctedIndex = proposalRange.index + runningCharacterOffset;

                            //DELETE TEXT AS DEFINED IN PROPOSAL
                            var deleteOperation = new Delta().retain(correctedIndex).delete(proposalRange.length);

                            if(currentProposal.new_wording)
                            {
                                var proposalText = JSON.parse(currentProposal.new_wording);

                                //CAST PROPOSAL TEXT INTO DELTA
                                var wordingToInsert = new Delta(proposalText);
                                newLength = wordingToInsert.length();

                                //COMBINE WITH DELETE OPERATION INTO SINGLE DELTA
                                deltaToInsert = deleteOperation.concat(wordingToInsert);
                            }
                            else
                            {
                                deltaToInsert = deleteOperation;
                                newLength = 0;
                            }

                            //INCORPORATE DELTA INTO EXISTING ARTICLE
                            var updatedArticle = article.compose(deltaToInsert);

                            //CALCULATE CHANGE IN ARTICLE LENGTH TO DETERMINE RUNNING CHARACTER OFFSET
                            var originalLength;
                            if(currentProposal.original_wording !== 'null')
                            {
                                var originalWording = new Delta(JSON.parse(currentProposal.original_wording));
                                originalLength = originalWording.length()
                            }
                            else
                            {
                                originalLength = 0;
                            }

                            runningCharacterOffset = runningCharacterOffset + newLength - originalLength;

                            //LOOP BACKWARDS THROUGH ARTICLE FOR EMPTY OPERATIONS IN UPDATED ARTICLE DELTA
                            var opNum = updatedArticle.ops.length;
                            while (opNum--)
                            {
                                if (Object.keys(updatedArticle.ops[opNum]).length === 0)
                                {
                                    //REMOVE IF EMPTY
                                    updatedArticle.ops.splice(opNum, 1);
                                }
                                else
                                {
                                    continue;
                                }
                            }


                            //SET ARTICLE AS UPDATED ARTICLE FOR NEXT LOOP
                            article = updatedArticle;
                        }

                        //RENDER ARTICLE
                        this.articleQuill.setContents(article);
                        this.articleQuill.disable();

                    }).bind(this)

                });

            }).bind(this)

        });

    },


//-----------------------------------------------------------------------------------------------------------------

    renderProposalSidebarInterface: function (proposalIdentifier, range, type)
    {

        var declarationText;
        switch(type)
        {
            case 'add':
                declarationText = 'I propose to add the following:';
                break;
            case 'replace':
                declarationText = 'I propose to replace this with the following:';
                break;
            case 'remove':
                declarationText = 'I propose to remove this.';
                break;
        }

        //PARENT CONTAINER
        var proposalContainer = $('<div/>', {
            id: 'proposal-' + proposalIdentifier,
            class: 'proposalContainer'
        });

        //INITIAL DECLARATION
        var initialDeclaration = $('<h3/>',
            {
                text: 'I propose a change to this part of the article:',
                id: 'initialDeclaration'
            });

        //BUTTONS
        var saveProposalButton = $('<button/>',
            {
                type: 'button',
                id: 'saveProposalButton',
                class: 'btn btn-success',
                text: 'Save Proposal',
                style: 'display: none;'
            });
        //BUTTONS
        var discardProposalButton = $('<button/>',
            {
                type: 'button',
                id: 'discardProposalButton',
                class: 'btn btn-warning',
                text: 'Discard Proposal'
            });

        //EDITORS
        var originalWordingEditorDiv = $('<div/>', {
            id: 'originalWordingEditor-'+proposalIdentifier,
            class: 'originalWordingEditor'
        });

        //EDITORS
        var proposedWordingContainer = $('<div/>',
            {
                class: 'proposedWordingContainer',
                style: 'display: none;'
                //ACTS AS CONTAINER TO HIDE ADDITIONAL ELEMENTS GENERATED BY QUILL
            });

        //EDITORS
        var proposedWordingEditorDiv = $('<div/>', {
            id: 'proposedWordingEditor-'+proposalIdentifier,
            class: 'proposedWordingEditor'

        });

        //EDITORS
        var justificationWordingEditorDiv = $('<div/>', {
            id: 'justificationEditor-'+proposalIdentifier,
            class: 'justificationEditor',
            style: 'display: none;'
        });

        //PROPOSAL DECLARATION
        var proposalDeclaration = $('<h3/>',
            {
                text: declarationText,
                style: 'display: none;',
                id: 'proposalDeclaration'
            });

        //JUSTIFICATION DECLARATION
        var justificationDeclaration = $('<h3/>',
            {
                text: 'I provide the following justification:',
                style: 'display: none;',
                id: 'justificationDeclaration'
            });


        //REMOVE/REPLACE RADIO BUTTONS
        var radioSelector = $('<div/>',
            {
                class: 'radioSelector'
            });

        //REMOVE/REPLACE RADIO BUTTONS
        var labelReplace = $('<label/>',
            {
            });

        //REMOVE/REPLACE RADIO BUTTONS
        var radioReplace = $('<div/>',
            {
                class: 'radio'
            });

        //REMOVE/REPLACE RADIO BUTTONS
        var radioButtonReplace = $('<input/>',
            {
                id: 'radioButtonReplace',
                type: 'radio',
                name: 'replaceOrRemove'
            });

        //REMOVE/REPLACE RADIO BUTTONS
        var labelRemove = $('<label/>',
            {
            });

        //REMOVE/REPLACE RADIO BUTTONS
        var radioRemove = $('<div/>',
            {
                class: 'radio'
            });

        //REMOVE/REPLACE RADIO BUTTONS
        var radioButtonRemove = $('<input/>',
            {
                id: 'radioButtonRemove',
                type: 'radio',
                name: 'replaceOrRemove'
            });


        //BUILD SIDEBAR DEPENDENT UPON PROPOSAL TYPE
        if(type === 'add')
        {
            proposalDeclaration.css('display', 'block');
            saveProposalButton.css('display', 'inline-block');
            proposedWordingContainer.css('display', 'block');
            justificationDeclaration.css('display', 'block');
            justificationWordingEditorDiv.css('display', 'block');

            proposalDeclaration.appendTo(proposalContainer);

        }
        else if(type === 'replace' || type === 'remove')
        {
            //HIDE ITEMS FOR SWITCHING BETWEEN REMOVE/REPLACE
            if(type === 'replace')
            {
                radioButtonReplace.prop('checked',true);
                proposalDeclaration.css('display', 'block');
                saveProposalButton.css('display', 'inline-block');
                proposedWordingContainer.css('display', 'block');
                justificationDeclaration.css('display', 'block');
                justificationWordingEditorDiv.css('display', 'block');
            }

            //HIDE ITEMS FOR SWITCHING BETWEEN REMOVE/REPLACE
            if(type === 'remove')
            {
                radioButtonRemove.prop('checked',true);
                proposalDeclaration.css('display', 'block');
                saveProposalButton.css('display', 'inline-block');
                justificationDeclaration.css('display', 'block');
                justificationWordingEditorDiv.css('display', 'block');
            }

            //BUILD FULL SIDEBAR
            initialDeclaration.appendTo(proposalContainer);
            originalWordingEditorDiv.appendTo(proposalContainer);

            radioButtonReplace.appendTo(labelReplace);
            radioButtonRemove.appendTo(labelRemove);
            labelRemove.appendTo(radioRemove);
            labelReplace.appendTo(radioReplace);

            labelReplace.append("Replace this with:");
            labelRemove.append("Remove this:");

            radioRemove.appendTo(radioSelector);
            radioReplace.appendTo(radioSelector);

            //BIND RADIO BUTTON RUNCTIONALITY
            this.bindProposalReplaceFunctionality(radioSelector);

            radioSelector.appendTo(proposalContainer);
            proposalDeclaration.appendTo(proposalContainer);

        }
        else
        {
            return;
        }

        //BUILD COMMON SIDEBAR ELEMENTS
        proposedWordingEditorDiv.appendTo(proposedWordingContainer);
        proposedWordingContainer.appendTo(proposalContainer);

        justificationDeclaration.appendTo(proposalContainer);
        justificationWordingEditorDiv.appendTo(proposalContainer);

        saveProposalButton.appendTo(proposalContainer);
        discardProposalButton.appendTo(proposalContainer);

        //MAKE ACCORDION AND ATTACH TO DOM
        var accordion = this.createAccordion(proposalIdentifier, proposalContainer, false);
        accordion.appendTo(this.$proposalSidebar);

        //RENDER QUILL EDITORS IN SIDEBAR - ADD NEEDS NO ORIGINAL WORDING EDITOR
        var originalWordingEditor = null;
        if (type === 'replace' || type === 'remove')
        {
            originalWordingEditor = this.renderOriginalWordingQuill('#originalWordingEditor-'+proposalIdentifier);
        }

        var proposedWordingEditor = this.renderProposedWordingQuill('#proposedWordingEditor-'+proposalIdentifier);
        var justificationWordingEditor = this.renderJustificationQuill('#justificationEditor-'+proposalIdentifier);

        //RECORD EDITORS IN PROPOSAL OBJECT
        this.proposalArray[proposalIdentifier].quillEditors =
        {
            proposedWordingEditor: proposedWordingEditor,
            justificationWordingEditor: justificationWordingEditor,
            originalWordingEditor: originalWordingEditor
        };


        //BIND THE SUBMISSION FUNCTIONALITY TO THE SIDEBAR BUTTON
        var ArticleEditor = this;
        this.bindProposalSaveFunctionality(ArticleEditor, saveProposalButton, proposalIdentifier);
        this.bindProposalDiscardFunctionality(ArticleEditor, discardProposalButton, proposalIdentifier);
    },

//-----------------------------------------------------------------------------------------------------------------

    activateReviewMode: function()
    {
        this.$reviewTab.addClass('active');
        this.$votingTab.removeClass('active');

        this.$votingSidebar.children("[id^='accordionParent-']").remove();
        this.closeVotingSideBar();

        this.$myProposalsButton.show();
        this.$rejectButton.show();
        this.$acceptButton.show();
        this.$proposeChangesButton.show();

        for (var proposalIdentifier in this.activeMarkers)
        {

            if(this.activeMarkers[proposalIdentifier].type === 'existing')
            {
                $(this.activeMarkers[proposalIdentifier].marker).remove();
                delete this.activeMarkers[proposalIdentifier];
            }
        }

    },

//-----------------------------------------------------------------------------------------------------------------

    createAccordion: function(proposalIdentifier, proposalContainer, group)
    {
        //CREATE DOM INFRASTRUCTURE FOR PROPOSAL
        var accordion = $('<div/>', {
            id: 'accordionParent-'+ proposalIdentifier,
            class: 'panel-group'
        });

        var panel = $('<div/>', {
            class: 'panel panel-primary'
        });

        var panelHeading = $('<div/>', {
            class: 'panel-heading'
        });

        var panelTitle = $('<h4/>', {
            class: 'panel-title'
        });


        var descriptor;

        if(group)
        {
            descriptor = 'Multiple Proposals'
        }
        else
        {
            descriptor = 'Proposal #' + proposalIdentifier;
        }


        var dataToggle = $('<a/>', {
            href: '#accordion-'+ proposalIdentifier,
            text: descriptor
        });
        //APPEND TOGGLE FEATURES BECAUSE JQUERY DOES NOT ALLOW THESE IN OBJECT NOTATION
        dataToggle.attr("data-toggle", "collapse").attr('data-parent', '#accordionParent-'+ proposalIdentifier);

        var accordionBody = $('<div/>', {
            id: 'accordion-'+ proposalIdentifier,
            class: 'panel-collapse collapse in'
        });

        var panelBody = $('<div/>', {
            class: 'panel-body'
        });

        //BUILD THE SIDEBAR
        dataToggle.appendTo(panelTitle);
        panelTitle.appendTo(panelHeading);
        panelHeading.appendTo(panel);

        proposalContainer.appendTo(panelBody);

        panelBody.appendTo(accordionBody);
        accordionBody.appendTo(panel);

        accordion.append(panel);

        return accordion;
    },

//-----------------------------------------------------------------------------------------------------------------

    activateVotingMode: function()
    {
        this.$votingTab.addClass('active');
        this.$reviewTab.removeClass('active');

        this.unbindProposalFunctionality();

        $('.overlayMarker-newMarker').hide();

        this.closeProposalSideBar();
        this.$myProposalsButton.hide();
        this.$rejectButton.hide();
        this.$acceptButton.hide();
        this.$proposeChangesButton.hide();

        this.openVotingSideBar();

        this.getCurrentArticleProposals();


    },

//-----------------------------------------------------------------------------------------------------------------

    openVotingSideBar: function ()
    {
        this.$votingSidebar.css("width", "400px");
        this.$mainContent.css("marginLeft", "400px");
    },

//-----------------------------------------------------------------------------------------------------------------

    closeVotingSideBar: function ()
    {

        this.$votingSidebar.css("width", "0px");
        this.$mainContent.css("marginLeft", "auto");
    },

//-----------------------------------------------------------------------------------------------------------------

    getCurrentArticleProposals: function()
    {
        $.ajax({
            type: "GET",
            url: "http://castdev/proposals/show",
            success: (function(data)
            {

                var existingProposals = this.JSONRecursiveParseProposals(data);

                //SORT BY UPVOTES
                existingProposals.sort(function(a,b) { return ( (b.up_vote > a.up_vote) ? 1 : (a.up_vote > b.up_vote) ? -1 : 0);} );

                var mappedProposals = this.mapOverlappingProposals(existingProposals);

                this.renderStandardProposalVotingInterface.call(this, this.$votingSidebar, mappedProposals['NonOverlappingProposals']);
                this.renderOverlappingProposalVotingInterface(mappedProposals['OverlappingProposals']);

                var articleEditor = this;
                this.bindVotingFunctionality(articleEditor);

            }).bind(this)

        });
    },

//--------------------------------------------------------------------------------------------------------------

    JSONRecursiveParseProposals: function(data)
    {

        var proposalArray;

        try
        {
            proposalArray = JSON.parse(data);
        }
        catch(e)
        {
            proposalArray = data;
        }


        for (var i = 0; i < proposalArray.length; i++)
        {

            var proposal = proposalArray[i];

            for (var item in proposal )
            {

                try
                {
                    proposal[item] = JSON.parse(proposal[item]);
                }
                catch(e)
                {
                    continue;
                }
            }
            proposalArray[i] = proposal;
        }

        return proposalArray;

    },

//--------------------------------------------------------------------------------------------------------------

    mapOverlappingProposals: function(existingProposals)
    {
        var overlapMapping = [];
        var overlappingProposalSet;
        var nonOverlappingProposals = [];
        var splicedProposalArray;
        var arraySliceStart;
        var arraySliceEnd;
        var existingProposal;
        var overlapAlreadyRecorded;

        for (var i = 0; i < existingProposals.length; i++)
        {

            overlapAlreadyRecorded = false;
            existingProposal = existingProposals[i];

            //LOOP THROUGH OVERLAP MAPPING TO CHECK IF THIS PROPOSAL HAS
            //ALREADY BEEN IDENTIFIED AS OVERLAPPING
            if (overlapMapping.length)
            {
                for (var k = 0; k < overlapMapping.length; k++)
                {

                    if (overlapMapping[k].indexOf(existingProposal) > -1)
                    {
                        overlapAlreadyRecorded = true;
                        break;
                    }
                }
            }

            //CHECK IF PROPOSAL OVERLAPS WITH ANY OTHER PROPOSALS
            if(!overlapAlreadyRecorded)
            {
                //EXTRACT PROPOSAL FROM ARRAY AND RECONSTRUCT REMAINING ARRAY
                arraySliceStart = existingProposals.slice(0, i);
                arraySliceEnd = existingProposals.slice(i+1, existingProposals.length);
                splicedProposalArray = arraySliceStart.concat(arraySliceEnd);

                //PERFORM CHECK (RETURNS ALL OVERLAPPING ITEMS)
                var overlappingProposals = this.checkForRangeOverlaps(existingProposal, splicedProposalArray);

                //IF FUNCTION RETURNS ANY, RECORD THESE OVERLAPS IN OVERLAP MAPPING
                if(overlappingProposals.length)
                {
                    overlappingProposalSet = overlappingProposals.concat(existingProposal);
                    overlapMapping.push(overlappingProposalSet);
                }
                else
                {
                    nonOverlappingProposals.push(existingProposal);
                }
            }
        }

        return {
            OverlappingProposals : overlapMapping,
            NonOverlappingProposals : nonOverlappingProposals
        };
    },

//--------------------------------------------------------------------------------------------------------------

    renderStandardProposalVotingInterface: function(targetElement, existingProposals)
    {

        var originalDeclarationText;
        var newDeclarationText;
        var existingProposal;

        for (var i = 0; i < existingProposals.length; i++)
        {

            existingProposal = existingProposals[i];

            //DETERMINE CORRECT DECLARATION TEXT BASED UPON TYPE
            switch (existingProposal.type)
            {
                case 'add':
                    originalDeclarationText = "";
                    newDeclarationText = "Add the following wording:";
                    break;

                case 'replace':
                    originalDeclarationText = "Replace this wording";
                    newDeclarationText = "With the following wording:";
                    break;

                case 'remove':
                    originalDeclarationText = "Remove this wording";
                    newDeclarationText = "";

                    break;
            }

            //CREATE DOM ELEMENTS FOR DECLARATIONS
            var originalWordingDeclaration = $('<h3/>',
                {
                    text: originalDeclarationText,
                    id: 'originalWordingDeclaration-'+proposalIdentifier
                });

            var newWordingDeclaration = $('<h3/>',
                {
                    text: newDeclarationText,
                    id: 'newWordingDeclaration-'+proposalIdentifier
                });

            var justificationWordingDeclaration = $('<h3/>',
                {
                    text: "Based upon the following justification:",
                    id: 'justificationWordingDeclaration-'+proposalIdentifier
                });


            //ASSIGN ID FOR DOM ELEMENT TRACKING
            var proposalIdentifier = Math.random().toString(36).substring(7);

            //CREATE CONTAINER
            var proposalContainer = $('<div/>', {
                id: 'proposal-' + proposalIdentifier,
                class: 'proposalContainer'
            });

            //CREATE PARENT DIVS
            var originalWordingDiv = $('<div/>', {
                id: 'originalWordingProposal-'+proposalIdentifier
            });

            var newWordingDiv = $('<div/>', {
                id: 'newWordingProposal-'+proposalIdentifier
            });

            var justificationWordingDiv = $('<div/>', {
                id: 'justificationWordingProposal-'+proposalIdentifier
            });

            var votingButtonDiv = $('<div/>', {
                id: 'votingButtonContainter-'+proposalIdentifier
            });

            var voteUpButton = $('<button/>', {
                id: 'voteUpButton-'+proposalIdentifier,
                text: 'Vote Up',
                class: 'btn btn-warning voteButton',
                type: 'button'
            });

            var voteDownButton = $('<button/>', {
                id: 'voteDownButton-'+proposalIdentifier,
                text: 'Vote Down',
                class: 'btn btn-warning voteButton',
                type: 'button'
            });

            votingButtonDiv.append(voteUpButton, voteDownButton);

            //INITIALISE CONTAINER AND ACCORDION
            proposalContainer.append(originalWordingDeclaration, originalWordingDiv, newWordingDeclaration, newWordingDiv, justificationWordingDeclaration, justificationWordingDiv, votingButtonDiv);
            var accordion = this.createAccordion(proposalIdentifier,proposalContainer, false);
            targetElement.append(accordion);

            //COLLAPSE THE ACCORDION FOR TIDINESS
            var accordionInDOM = $('#accordion-'+ proposalIdentifier);
            accordionInDOM.collapse('hide');
            accordionInDOM.attr('data-cryptoid', existingProposal.id);


            //INSTANTIATE EDITORS
            var originalWordingEditor = new Quill('#'+'originalWordingProposal-'+proposalIdentifier, {
                theme: 'bubble'
            });

            var newWordingEditor = new Quill('#'+'newWordingProposal-'+proposalIdentifier, {
                theme: 'bubble'
            });

            var justificationWordingEditor = new Quill('#'+'justificationWordingProposal-'+proposalIdentifier, {
                theme: 'bubble'
            });


            //PARSE WORDING FROM PROPOSAL OBJECT
            var originalWording = existingProposal.original_wording;
            var newWording = existingProposal.new_wording;
            var justificationWording = existingProposal.justification;

            //POPULATE EDITORS
            originalWordingEditor.setContents(originalWording);
            originalWordingEditor.disable();
            newWordingEditor.setContents(newWording);
            newWordingEditor.disable();
            justificationWordingEditor.setContents(justificationWording);
            justificationWordingEditor.disable();

            //HIDE NON-APPLICABLE DOM ELEMENTS
            switch (existingProposal.type)
            {
                case "add" :
                    originalWordingDiv.hide();
                    originalWordingDeclaration.hide();
                    break;
                case "remove" :
                    newWordingDiv.hide();
                    newWordingDeclaration.hide();
                    break;
                case "replace" :
                    break;
            }

            //SET UP OVERLAY MARKERS
            var range = existingProposal.range;
            var existingProposalMarker = this.generateOverlayMarker(range, 'existingMarker', proposalIdentifier);


            //PANEL HEADING IS CLICK TARGET FOR UI BINDING
            var panelHeading = accordionInDOM.closest('.panel-primary').find('.panel-heading');

            //BIND MARKER FUNCTIONALITY TO ACCORDION
            this.renderVoteResultsBar(accordionInDOM, existingProposal, proposalIdentifier);

            //HIDE THE MARKER UNTIL THE PROPOSAL IS ACTIVE
            existingProposalMarker.css('display', 'none');

            this.recordActiveMarkers(proposalIdentifier, 'existing', range, existingProposalMarker)

            //BIND MARKER FUNCTIONALITY TO PANEL HEADING
            this.bindExistingProposalToMarkerLinks(panelHeading, existingProposalMarker);
        }


    },

//--------------------------------------------------------------------------------------------------------------

    renderOverlappingProposalVotingInterface : function(overlappingProposals)
    {

        for (var i=0; i < overlappingProposals.length; i++)
        {

            var proposalGroupIdentifier = Math.random().toString(36).substring(7);

            //CREATE CONTAINER
            var proposalGroupContainer = $('<div/>', {
                id: 'proposalGroup-' + proposalGroupIdentifier,
                class: 'proposalContainer'
            });

            var groupAccordion = this.createAccordion(proposalGroupIdentifier, proposalGroupContainer, true);
            this.$votingSidebar.append(groupAccordion);
            var accordionInDOM = $('#accordion-'+ proposalGroupIdentifier);
            accordionInDOM.collapse('hide');
            var panelHeading = accordionInDOM.closest('.panel-primary').find('.panel-heading');

            var groupMinIndex;
            var groupMaxIndex;
            var currentRange;
            var firstLoop = true;
            var currentStartIndex;
            var currentEndIndex;

            for (var k = 0; k < overlappingProposals[i].length; k++ )
            {
                currentRange = overlappingProposals[i][k].range;

                currentStartIndex = currentRange.index;
                currentEndIndex = currentStartIndex + currentRange.length;

                if (firstLoop)
                {
                    groupMinIndex = currentStartIndex;
                    groupMaxIndex = currentEndIndex;

                    firstLoop = false;
                    continue;
                }


                if (currentStartIndex < groupMinIndex)
                {
                    groupMinIndex = currentStartIndex;
                }

                if (currentEndIndex > groupMaxIndex)
                {
                    groupMaxIndex = currentEndIndex;
                }

            }

            var groupLength = groupMaxIndex - groupMinIndex;
            var range = {index: groupMinIndex, length: groupLength};

            var existingProposalMarker = this.generateOverlayMarker(range, 'existingMarker', proposalGroupIdentifier);

            //HIDE THE MARKER UNTIL THE PROPOSAL IS ACTIVE
            existingProposalMarker.css('display', 'none');

            this.recordActiveMarkers(proposalGroupIdentifier, 'existing', range, existingProposalMarker)

            this.bindExistingProposalToMarkerLinks(panelHeading, existingProposalMarker);
            this.renderStandardProposalVotingInterface(proposalGroupContainer, overlappingProposals[i]);
        }
    },

//--------------------------------------------------------------------------------------------------------------

    bindExistingProposalToMarkerLinks : function(target, marker)
    {


        target.on('click', function()
        {

            target.siblings("[id^='accordion-']").collapse('toggle');


            //COLLAPSE ALL OTHER ACCORDIONS, EXCEPT WHERE ACCORDION IS PARENT TO TARGET
            $("[id^='accordion-']").not(target.parents("[id^='accordion-']")).each(
                function()
                {
                    $(this).collapse('hide');
                }
            );

            //GET VISIBILITY OF MARKER
            var visibility =(marker.css('display'));

            //HIDE ALL OTHER MAKERS
            $("[id^='existingMarker-']").css('display', 'none');

            //SHOW OR HIDE DEPENDENT ON VISIBILITY
            if(visibility === 'none')
            {
                marker.css('display', 'block');
                marker.children()[0].scrollIntoView({'behavior': 'smooth'});
            }
            else
            {
                marker.css('display', 'none');
            }

        });

    },

//--------------------------------------------------------------------------------------------------------------

    renderVoteResultsBar: function(accordion, proposal, proposalIdentifier)
    {

        var panelHeading = accordion.closest('.panel-primary').find('.panel-heading');

        var progressBar = $('<div/>', {
            id: 'progressbar-' + proposalIdentifier
        });

        var upVotes = proposal.up_vote;
        var totalVotes = upVotes + proposal.down_vote;

        var score = (upVotes / totalVotes) * 100;


        panelHeading.append(progressBar);

        $( "#progressbar-" + proposalIdentifier ).progressbar({
            value: score
        });


    },

//--------------------------------------------------------------------------------------------------------------

    checkForRangeOverlaps : function(proposal, proposalArray)
    {
        var overlappingProposals = [];

        for (var proposalIdentifier in proposalArray)
        {

            //CHECK IF PROPOSAL EXISTS
            if (!proposalArray.hasOwnProperty(proposalIdentifier))
            {
                continue;
            }

            var existingProposalRange = proposalArray[proposalIdentifier].range;

            //case one - beginning overlaps
            var overlapCaseOne =  proposal.range.index >= existingProposalRange.index && proposal.range.index <= (existingProposalRange.index + existingProposalRange.length);

            //case two - end overlaps
            var overlapCaseTwo = (proposal.range.index + proposal.range.length) >= existingProposalRange.index && (proposal.range.index + proposal.range.length) <= (existingProposalRange.index + existingProposalRange.length);

            //case three - existing proposal is subset of new proposal
            var overlapCaseThree = proposal.range.index <= existingProposalRange.index && (proposal.range.index + proposal.range.length) >= (existingProposalRange.index + existingProposalRange.length);

            if( overlapCaseOne === true || overlapCaseTwo === true || overlapCaseThree === true)
            {
                overlappingProposals.push(proposalArray[proposalIdentifier]);
            }
            continue;
        }

        return overlappingProposals;
    },


    bindVotingFunctionality: function(articleEditor)
    {
        var voteButtons = $('.voteButton');
        var voteButton;

        for (var i = 0; i < voteButtons.length; i++)
        {

            voteButton = $(voteButtons[i]);

            voteButton.on('click', function()
            {
                var voteType;
                var voteButtonID = $(this).attr('id');
                var proposalID = $(this).parents("[id^='accordion-']").attr('data-cryptoid');

                if(voteButtonID.startsWith('voteUpButton'))
                {
                    voteType = 'up';
                }
                else if(voteButtonID.startsWith('voteDownButton'))
                {
                    voteType = 'down'
                }
                else {return false};


                for (var index in articleEditor.votes)
                {
                    if(articleEditor.votes[index].id === proposalID)
                    {
                        delete articleEditor.votes[index];
                        articleEditor.votes = articleEditor.votes.filter(function(n){ return n != null });
                    }

                }

                articleEditor.votes.push
                (
                    {
                        id: proposalID,
                        voteType: voteType
                    }
                );

                var votesTotal = articleEditor.votes.length;
                articleEditor.updateVoteSummary();



            });

        }
    },

    bindVoteSubmissionFunctionality: function()
    {

        var votes = this.votes;
        var voteType;
        var proposalID;

        for (var i = 0; i < votes.length; i++)
        {

            voteType = votes[i].voteType;
            proposalID = votes[i].id;

            $.ajax({
                type: "POST",
                url: "http://castdev/proposals/vote",
                data:
                {
                    "_token": this.$token,
                    "voteType": voteType,
                    "proposalID": proposalID
                },
                success: (function()
                {
                    alert('voted');
                    //TODO - CHANGE FROM ALERT
                }),
                dataType: "text"
            });
        }
    },

    updateVoteSummary: function()
    {

        var numberOfVotes = this.votes.length;
        var voteSummary = this.$voteSummary;
        var summaryString;
        var voteStake = this.voteStake;

        if(numberOfVotes === 0)
        {
            voteSummary.html('');
        }
        else if(numberOfVotes === 1)
        {
            summaryString = 'You are issuing 1 proposal vote. \n Total stake: ' + voteStake + 'CST';
            voteSummary.html(summaryString);
        }
        else
        {
            summaryString = 'You are issuing ' + numberOfVotes + ' proposal votes. \n Total stake: ' + (numberOfVotes*voteStake) + 'CST';
            voteSummary.html(summaryString);
        }

    }



};


































///
window.addEventListener("load", function() {
  if (typeof web3 !== "undefined") {
    window.web3 = new Web3(web3.currentProvider);
  } else {
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }

  User.setProvider(web3.currentProvider);
  ArticleContract.setProvider(web3.currentProvider);

  web3.eth.getAccounts(function(err, accounts) {
    if (err) {
      Dapp.throwError("Your browser can't see the decentralized web!", err);
    }
    if (accounts.length == 0) {
      Dapp.throwError("Connect an account!");
    }
    account = accounts[0];

      console.log('account: '  + account);

    window.Delta = Quill.import('delta');

    var currentPage = ($("body").data("title")).replace(/^[ ]+|[ ]+$/g,'');

    if(currentPage == 'article-create')
    {
      Dapp.init('create');
    }

    if(currentPage == 'article-review')
    {
      Dapp.init('review');
    }

  });
});

$(document).mousemove(function(e)
{
    window.x = e.pageX;
    window.y = e.pageY;
});


