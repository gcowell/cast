pragma solidity ^0.4.11;


import './SafeMath.sol';


contract Article{
    
    struct ProposedChanges
    {
        address proposalOwner;
        string proposalLocation;
        uint upVotesTotal;
        uint downVotesTotal;
        mapping(address => bool) upVotes;
        mapping(address => bool) downVotes;
        bool authorised;
    }

    struct ArticleDetails
    {
        string title;
        address author;
        string originalLocation;
        mapping(string => bool) proposalLocations;
        mapping(address => bool) proposalStakeholders;
        uint upVotesTotal;
        uint downVotesTotal;
        mapping(address => bool) upVotes;
        mapping(address => bool) downVotes;
        mapping(string => ProposedChanges) proposedChanges;
    }
  


  uint public ArticleCount;

  mapping(string => ArticleDetails) Articles;
   


//called when first deployed
    constructor() public 
    {
        ArticleCount = 0;
       
    }

  event uploadCheck(address sender, string _originalLocation, string _title);

  function uploadArticle(string _originalLocation, string _title) public returns (bool)
    {
     
      emit uploadCheck(msg.sender, _originalLocation, _title);
        
      Articles[_originalLocation] =
      ArticleDetails(
            {
                title: _title,
                author: msg.sender, 
                originalLocation: _originalLocation,
                upVotesTotal: 0,
                downVotesTotal: 0
            }
        );
        
        ArticleCount++;
        
        return true;

      }


//------------------------------------------------------------------------------------------------------

    function getOriginalArticle(string _originalLocation) public constant returns(string, address, string, uint, uint)
    {
          return (Articles[_originalLocation].title, Articles[_originalLocation].author, Articles[_originalLocation].originalLocation, Articles[_originalLocation].upVotesTotal, Articles[_originalLocation].downVotesTotal);
    }
    
    
    
//------------------------------------------------------------------------------------------------------

    
    function addProposal(string _proposalLocation, string _articleOriginalLocation) public returns (bool)
    {
        Articles[_articleOriginalLocation].proposedChanges[_proposalLocation] =
        ProposedChanges(        
            { 
                proposalOwner: msg.sender,
                proposalLocation: _proposalLocation,
                upVotesTotal: 0,
                downVotesTotal: 0,
                authorised: false
            }
        );
        
        return true;
            
    }


//------------------------------------------------------------------------------------------------------
        
    function addUpVote(string _originalLocation) public returns (bool)
    {
        if(Articles[_originalLocation].upVotes[msg.sender] == true || Articles[_originalLocation].downVotes[msg.sender] == true)
        {
            revert();
        }
        
        Articles[_originalLocation].upVotes[msg.sender] = true;
        Articles[_originalLocation].upVotesTotal++;
        
        return true;
    }
    
    
//------------------------------------------------------------------------------------------------------
    
    function addDownVote(string _originalLocation) public returns (bool)
    {
        if(Articles[_originalLocation].upVotes[msg.sender] == true || Articles[_originalLocation].downVotes[msg.sender] == true)
        {
            revert();
        }
        
        Articles[_originalLocation].downVotes[msg.sender] = true;
        Articles[_originalLocation].downVotesTotal++;
        
        return true;

    }


      //function addAuthoredArticle(address _user, address _authoredArticle) returns(bool){
        //  users[_user].authoredArticles[_authoredArticle] = true;
        //return true;
      //}

    //   function addReviewedArticle(address _user, address _reviewedArticle) returns(uint){
    //     return users[_user].reviewedArticles.push(_reviewedArticle);
    //   }

    //   function addCollaboratedArticle(address _user, address _colaboratedArticle) returns(uint){
    //     return users[_user].collaboratedArticles.push(_colaboratedArticle);
    //   }


     // function name(address _user) public constant returns(string _name){
       // return users[_user].name;
      //}


    //   function getAuthoredArticles(address _user) public constant returns (address[] _authoredArticles){
    //     return users[_user].authoredArticles;
    //   }

    //   function getReviewedArticles(address _user) public constant returns (address[] _reviewedArticles){
    //     return users[_user].reviewedArticles;
    //   }

    //   function getCollaboratedArticles(address _user) public constant returns (address[] _collaboratedArticles){
    //     return users[_user].reviewedArticles;
    //   }


    //   function indexOf(address[] values, address _x)returns (uint){
    //     for (uint i = 0; i < values.length; i++)
    //     if (values[i] == _x) return i;
    //     return uint(-1);
    //   }
    //   function remove_subscription(address _subscription, address _user)returns(bool){
    //     uint index = indexOf(profiles[_user].subscriptions, _subscription);
    //     if(index == uint(-1))
    //     return false;
    //     delete profiles[_user].subscriptions[index];
    //     return true;
    //   }
    }