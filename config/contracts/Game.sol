pragma solidity ^0.4.17;

import "./Owned.sol";

contract Game is Owned {  

    bytes32 public gameId;
    bool public isTie = false;
    
    struct Team {
        address id;
        uint score;
        int moneyLine;
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

    function setHomeTeam(address _home, int _moneyLine) public onlyOwner {
        home.id = _home;
        home.moneyLine = _moneyLine;
    }    

    function setVisitorTeam(address _visitor, int _moneyLine) public onlyOwner {
        visitor.id = _visitor;
        visitor.moneyLine = _moneyLine;
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

    function getCurrentMoneyLineByAddress(address _address) public view returns (int){
        if (_address == home.id) {
            return home.moneyLine;
        } else if (_address == visitor.id) {
            return visitor.moneyLine;

        } else {
            return (0);    
        }
        
    }    

    function getHomeMoneyLine() public view returns (int){
        return (home.moneyLine);
    }    

    function getVisitorMoneyLine() public view returns (int){
        return (visitor.moneyLine);
    }    

    function getWinner() public view returns (address) {
        return winner;
    }    

    


}