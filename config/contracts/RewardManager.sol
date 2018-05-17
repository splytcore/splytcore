pragma solidity ^0.4.23;

import "./Reward.sol";

contract RewardManager {
    
    
    address[] rewardsByIndex;
    mapping (string => address) rewardsById;

    modifier onlyUniqueId(string _id) {
        require(rewardsById[_id] == address(0x0));
        _;
    }

    function createReward(string _id) public onlyUniqueId(_id) returns (bool) {
        Reward reward = new Reward(_id, msg.sender);
        rewardsByIndex.push(reward);
        rewardsById[_id] = reward;
        return true;
    }

    function getRewardByIndex(uint _index) public view returns (address) {
        return rewardsByIndex[_index];
    }

    function getRewardById(string _id) public view returns (address) {
        return rewardsById[_id];
    }

    function getRewardsLength() public view returns (uint) {
        return rewardsByIndex.length;
    }
    

}