pragma solidity ^0.4.18;

import "./bountyfactory.sol";
import "./tipfactory.sol";

contract ZTPSInterface {
    function transferFrom(address _from, address _to, uint256 _value) public returns(bool);
    function balanceOf(address _owner) public constant returns (uint256 balance);
    
}

contract ZTips is BountyFactory, TipFactory{
    event tipReceived(uint bountyID, string condition1, string condition2, string condition3, address filehash);
    
    /*Ztips is a decentralised anonymous tipping platform allowing anonymous
    secure tips to be sent to the bounty setters.
    
    Main features:
    - Maintain a list of public bounty Setters
    - maintain a list of public Tipsters
    - Allow Bounty Setters to setup a Bounty
    - Allow people to anonymously give tips for certain bounties
    - Allow Tipsters to setup Bounties
    - Allow Timeout in bounties
    */
    
    ZTPSInterface private ztipsContract;
    address private contractAdmin;
    address private ztipsContractAddress;
    
    /* ZTips constructor
    arguments:
    */
    function ZTips(address _adminAddress, address _ztpsAddress) public {
        contractAdmin = _adminAddress;
        ztipsContractAddress = _ztpsAddress;
        ztipsContract = ZTPSInterface(_ztpsAddress);
    }
    
     modifier onlyAdmin(){
        require(msg.sender == contractAdmin);
        _;
    }
    
    function updateZtipsContractAddress(address _newAddress) external onlyAdmin {
        // WARNING: This function should be removed and replaced with a static address
        // once final Implementation goes on main network.
        ztipsContractAddress = _newAddress;
        ztipsContract = ZTPSInterface(_newAddress);
    }
    
     /**
     * @dev Deposit for ERC20 tokens using approveAndCall
     * @param _from Address sending the tokens
     * @param _value Amount of tokens sent
     * @param _token Token being deposited
     * @param _extraData Data payload being executed (payment reference)
     */
        //ERC20 token = ERC20(_token);
        //_recordIncomingTransaction(

    function receiveApproval(
        address _from, uint256 _value,
        address _token, bytes _extraData) external {
        // make sure the poc contract is the one that called us
        require(msg.sender == ztipsContractAddress);
        // make sure the address passed for _token is the same as the 
        // ztips contract
        require(_token == ztipsContractAddress);
        // call transfer from
        uint256 prevValue = ztipsContract.balanceOf(this);
        log1("previous contract value", bytes32(prevValue));
        ztipsContract.transferFrom(_from, this, _value);
        uint256 curValue = ztipsContract.balanceOf(this);
        log1("current contract value", bytes32(curValue));
        require((curValue - prevValue) == _value);
        // contract now has the tokens
        // _extraData = "bori,description,title,tags,conditions"
        if (_extraData[0] == "b") {
            // store in mapping that this bounty has been populated with money
            _createBounty(_from, string(_extraData), _value);
        } else {
            _createTip(_from, string(_extraData), _value);
        }
        
    }

    // Destroy the current contract
    function killContract() public onlyAdmin
    {
        selfdestruct(contractAdmin);
    }

}

