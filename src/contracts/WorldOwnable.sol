// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import {ByteHasher} from "./ByteHasher.sol";

interface IWorldID {
    function verifyProof(
        uint256 root,
        uint256 groupId,
        uint256 signalHash,
        uint256 nullifierHash,
        uint256 externalNullifierHash,
        uint256[8] calldata proof
    ) external view;
}


contract WorldOwnable {
    using ByteHasher for bytes;
    
    address private _owner;
    uint256 private _nullifierHash; 

    error OwnableUnauthorizedAccount(address account);

    error OwnableInvalidOwner(address owner);

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    error InvalidNullifier();

    IWorldID internal immutable worldId;

    uint256 internal immutable externalNullifierHash;

    uint256 internal immutable groupId = 1;

    mapping(uint256 => bool) internal nullifierHashes;

    constructor(
        IWorldID _worldId, 
        string memory _appId,
        string memory _action,
        address signal,
        uint256 root,
        uint256 nullifierHash,
        uint256[8] memory proof
    ) {
        worldId = _worldId;
        externalNullifierHash = abi
            .encodePacked(abi.encodePacked(_appId).hashToField(), _action)
            .hashToField();

        worldId.verifyProof(
            root,
            groupId, // set to "1" in the constructor
            abi.encodePacked(signal).hashToField(),
            nullifierHash,
            externalNullifierHash,
            proof
        );

        _nullifierHash = nullifierHash;
    }

    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    function owner() public view virtual returns (address) {
        return _owner;
    }

    function _checkOwner() internal view virtual {
        if (owner() != msg.sender) {
            revert OwnableUnauthorizedAccount(msg.sender);
        }
    }

    function transferOwnership(address newOwner) public virtual onlyOwner {
        if (newOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(newOwner);
    }

    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }

    function claimOwnership(
        address signal,
        uint256 root,
        uint256 nullifierHash,
        uint256[8] calldata proof
    ) public virtual{
        require(nullifierHash == _nullifierHash, "Invalid proof");
        worldId.verifyProof(
            root,
            groupId, 
            abi.encodePacked(signal).hashToField(),
            nullifierHash,
            externalNullifierHash,
            proof
        );

        _transferOwnership(msg.sender);
    }

}