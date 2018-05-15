pragma solidity ^0.4.23;

contract Reward {
    
    string public id; // unique mongo id

    enum Stage { ACTIVE, PENDING, VERIFIED, COMPLETE, ARBITRATION }

    Stage public stage;
    
    address public promisor;
    address public promisee;
    
    modifier onlyPromisor() {
        require(msg.sender == promisor);    
        _;
    }

    modifier onlyPromisee() {
        require(msg.sender == promisee);    
        _;
    }
    
    modifier onlyStage(Stage _stage) {
        require(stage == _stage);    
        _;
    }    
    
    //send reward amouont by owner
    function () public payable {
        
    }
    
    constructor(string _id, address _promisor) payable public {
        id = _id;
        promisor = _promisor;
        stage = Stage.ACTIVE;    
    }
    

    function setStage(Stage _stage) onlyPromisor public returns (bool) {
        stage = _stage;
        return true;
    }


    function getAmount() public view returns (uint) {
        return address(this).balance;
    }

    function setFulfilled() onlyStage(Stage.ACTIVE) public returns (bool) {
        stage = Stage.PENDING;
        promisee = msg.sender;
        return true;
    }

    function verify() onlyPromisor public returns (bool) {
        stage = Stage.VERIFIED;
        return true;
    }

    //Set stage back to false if found is untrue
    function verifyFalse() onlyPromisor public returns (bool) {
        stage = Stage.ACTIVE;
        return true;
    }


    function releaseReward() onlyStage(Stage.VERIFIED) public returns (bool) {
        address(promisee).transfer(address(this).balance);
        stage = Stage.COMPLETE;
        return true;
    }


    
}