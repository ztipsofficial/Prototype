pragma solidity ^0.4.18;
import "./ownable.sol";

contract BountyFactory is Ownable {
    
    event NewBounty(uint bountyId, string description, uint256 amount);

    struct Bounty {
        string description; //description = description,title,tags,conditions"
        uint8 state; // 0 = uninitialised, 1 = initialised,
        // 2 = paused, 3 = inprogress, 4 = claimed; 5 = spent/expired
        address fileHash; // Hash of ipfs file for this bounty
        uint amount;
    }

    //list of bounties
    Bounty[] public bounties;

    // mapping each bounty `id`(position in array) to it's equivalent owner(`address`)
    mapping (uint => address) public bountyToOwner;
    // mapping each owners address to number of bounties owned by `it`.
    mapping (address => uint) ownerBountyCount;
    
    function _createBounty(address _from, string description, uint amount) internal {
        //create new bounty and push it to bounties array
        // file address for ipfs would be blank by default
        address addr = 0x0;
        uint8 defaultState = 1;
        uint id = bounties.push(Bounty(description, defaultState, addr, amount));
        // store the owner of this bounty id = the address(msg.sender)
        bountyToOwner[id] = _from;
        // increase the number of bounties for this owner
        ownerBountyCount[_from]++;
        NewBounty(id, description, amount);
    }

    function getBountyCount() public view returns (uint256) {
        return bounties.length;
    }

    function pause() {
        require(ownerBountyCount[msg.sender] > 0);
        //BountyPaused()
    }
    
    // function _closeBounty() internal onlyOwner {
    //     // claimed or spent a bounty
        
    // }

}
