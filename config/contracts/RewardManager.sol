pragma solidity ^0.4.23;

import "./Reward.sol";

contract RewardManager {
    
    
    address[] rewardsByIndex;
    mapping (string => address) rewardsById;


    function createReward(string _id) public returns (bool) {
        Reward reward = new Reward(_id);
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