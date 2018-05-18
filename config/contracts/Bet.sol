pragma solidity ^0.4.17;

    
import "./Owned.sol";    
import "./Game.sol";

//@notice each game contract will have 2 contracts. 1 for betting on Team A and 1 for betting on Team B
contract Bet is Owned {  

    bytes32 public id;
    enum Stage { OPEN, ACTIVE, FINALIZED }
    
    bytes32 public betId;
    address public winningTeam;  //Which team money is on to win
    Game public game; //game bet on
    Stage currentStage;
    
    uint vig;
        
    struct Bettor {
        address wallet;
        uint wage;
        bool isPaid;
        int moneyLine;
    }

    mapping (address => Bettor) bettors;
    
    
    modifier onlyWon() {
        require(game.getWinner() == winningTeam);
        _;
    }

    modifier onlyStage(Stage _stage) {
        require(currentStage == _stage);
        _;
    }

    modifier onlyUnpaid() {
        require(bettors[msg.sender].isPaid == false);
        _;
    }
    
    function() public payable onlyStage(Stage.OPEN) {

        int moneyLine = game.getCurrentMoneyLineByAddress(winningTeam);
        
        bettors[msg.sender] = Bettor(msg.sender, msg.value, false, moneyLine);

    }
    
    constructor(address _gameAddress) public {
        betId = "betId";
        game = Game(_gameAddress);
        // winningTeam = _teamId;
    }    

    
    //@notice set final stage where you cant change state
    // function finalize() public onlyStage(Stage.ACTIVE) onlyOwner {
    //     if (winningTeam == game.winner()) {
    //         isWon = true;    
    //     }
        
    // }    

    //@notice if this contract is set to won, all address can withdraw 
    function payMe() public onlyWon onlyUnpaid returns (uint){
        bettors[msg.sender].isPaid = true;
        uint myWinnings;
        if (bettors[msg.sender].moneyLine > 0) {
            myWinnings = bettors[msg.sender].wage * (uint(bettors[msg.sender].moneyLine) / 100);
        } else {
            myWinnings = bettors[msg.sender].wage / (uint(bettors[msg.sender].moneyLine) / 100);
        }
        bettors[msg.sender].wallet.transfer(myWinnings);
        return myWinnings;
    }    

    function getBet() public view returns (bytes32, address, uint, bool) {
        
        return (betId, bettors[msg.sender].wallet, bettors[msg.sender].wage, bettors[msg.sender].isPaid);
        
    }    
    
    function setStage(Stage _stage) public onlyOwner {
        currentStage = _stage;
    }        

    function nextStage() internal {
        currentStage = Stage(uint(currentStage) + 1);
    }        

    // function updateMoneyLine(int _moneyLine) public onlyOwner {
    //     currentMoneyLine = _moneyLine;
    // }        

}