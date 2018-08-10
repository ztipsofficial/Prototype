pragma solidity ^0.4.18;
import "./ownable.sol";

contract TipFactory is Ownable{
    
    event NewTip(uint tipId, string description, uint state, bool pub);

    struct Tip {
        string description; // `title;tags;description`
        uint8 state; // 0 = uninitialised, 1 = initialised,
        // 2 = paused, 3 = inprogress, 4 = accepted; 5 = declined
        bool pub; // private or public nature of tip
        address fileaddress; // Hash of ipfs file for this bounty
        uint bountyID;
    }
    
    Tip[] public tips;
    //list of list tips
    
    mapping (uint => address) public tipToOwner;
    // mapping each bounty `id`(position in array) to it's equivalent owner(`address`)
    mapping (address => uint) ownerTipCount;
    // mapping each owners address to number of bounties owned by `it`.

    function bytesToUint(bytes b) pure private returns (uint) {
        uint result = 0;
        for (uint i = 0; i < b.length; i++) { // c = b[i] was not needed
            if (b[i] >= 48 && b[i] <= 57) {
                result = result * 10 + (uint(b[i]) - 48); // bytes and int are not compatible with the operator -.
            }
        }
        return result; // this was missing
    }
    
    //Functions
    function _createTip(address _from, string description, uint value) internal {
        bytes memory bid = new bytes(4);
        bytes memory d = bytes(description);
        for (uint count = 0; count < 5; count++) {
            if (d[count] != "," ) {
                bid[count] = d[count];
                } else {
                    break;
                } 
        }
        uint bountyID = bytesToUint(bid);
        
        uint id = tips.push(Tip(description, uint8(value), false, 0x0, bountyID));
        // store the owner of this bounty id = the address(msg.sender)
        tipToOwner[id] = _from;
        // increase the number of bounties for this owner
        ownerTipCount[_from]++;
        NewTip(1, description, 0, false);
    }

    function getTipCount() public view returns (uint256) {
        return tips.length;
    }
    
    //override
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0));
        
    }

}
