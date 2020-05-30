pragma solidity ^0.4.11;


import './SafeMath.sol';


contract User{

  struct ProfileDetails
  {
    string name;
    mapping(address => bool) authoredArticles;
    mapping(address => bool) reviewedArticles;
    mapping(address => bool) collaboratedArticles;
  }

  uint public UserCount;

  mapping(address => ProfileDetails) users;


//called when first deployed
    function User()
    {
        UserCount = 0;
    }

  function registerUser(string _name) public returns (bool)
    {
      users[msg.sender] =
      ProfileDetails(
            {
            name: _name
            }
        );
        return true;

      }


      function addAuthoredArticle(address _user, address _authoredArticle) returns(bool){
          users[_user].authoredArticles[_authoredArticle] = true;
        return true;
      }

    //   function addReviewedArticle(address _user, address _reviewedArticle) returns(uint){
    //     return users[_user].reviewedArticles.push(_reviewedArticle);
    //   }

    //   function addCollaboratedArticle(address _user, address _colaboratedArticle) returns(uint){
    //     return users[_user].collaboratedArticles.push(_colaboratedArticle);
    //   }


      function name(address _user) public constant returns(string _name){
        return users[_user].name;
      }


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