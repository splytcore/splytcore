pragma solidity ^0.4.17;

import "./Owned.sol";

contract Game is Owned {  

    bytes32 public gameId;
    bool public isTie = false;
    
    struct Team {
        address id;
        uint score;
    }
    
    Team home;
    Team visitor;
    
    enum Stage { CLOSED, OPEN, PROGRESS, GAME_OVER, FINALIZED }
    
    Stage currentStage;
    
    address public winner;
    
    modifier onlyStage(Stage _stage) {
        require(currentStage == _stage);
        _;
    }
    
    constructor() public {
        gameId = "gameId";
    }    

    function setTeams(address _visitor, address _home) public onlyOwner {
        visitor.id = _visitor;
        home.id = _home;
    }    

    function setWinner() public onlyOwner onlyStage(Stage.GAME_OVER) {
        if (home.score == visitor.score) {
            isTie = true;
        } else  if (home.score > visitor.score) {
            winner = home.id;
        } else {
            winner = visitor.id;    
        }
    }    

    function setGameStarted() public returns (bool) {
        currentStage = Stage.PROGRESS;
    }    


    function setGameOver(uint _visitorScore, uint _homeScore) public onlyOwner onlyStage(Stage.PROGRESS) {
        home.score = _homeScore;
        visitor.score = _visitorScore;
        currentStage = Stage.GAME_OVER;
    }    

    function getTeams() public view returns (address, address){
        return (visitor.id, home.id);
    }    

    function getWinner() public view returns (address) {
        return winner;
    }    

    


}