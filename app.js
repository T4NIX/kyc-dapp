
// Wait for the DOM to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {
    // ==================================================================================
    // !!! IMPORTANT !!!
    //
    // 1. PASTE YOUR CONTRACT ADDRESS BELOW
    //    You can get this from Remix after deploying your contract.
    //
    const contractAddress = 'PASTE_YOUR_CONTRACT_ADDRESS_HERE';

    // 2. PASTE YOUR CONTRACT ABI BELOW
    //    You can get this from the "Compiler" tab in Remix.
    //    Find your contract, and click the "ABI" button to copy it.
    //
    const contractABI = [
        
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "userHash",
				"type": "string"
			}
		],
		"name": "KYCRegistered",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			}
		],
		"name": "KYCVerified",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "admin",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_user",
				"type": "address"
			}
		],
		"name": "getKYCStatus",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			},
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "kycRecords",
		"outputs": [
			{
				"internalType": "string",
				"name": "userHash",
				"type": "string"
			},
			{
				"internalType": "bool",
				"name": "isVerified",
				"type": "bool"
			},
			{
				"internalType": "bool",
				"name": "isRegistered",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_userHash",
				"type": "string"
			}
		],
		"name": "registerKYC",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_user",
				"type": "address"
			}
		],
		"name": "verifyKYC",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}

    ];
    // ==================================================================================


    // --- DOM Element References ---
    const connectWalletBtn = document.getElementById('connectWalletBtn');
    const walletStatus = document.getElementById('walletStatus');
    const walletAddress = document.getElementById('walletAddress');
    const logDiv = document.getElementById('log');

    const registerBtn = document.getElementById('registerBtn');
    const kycHashInput = document.getElementById('kycHashInput');

    const adminSection = document.getElementById('adminSection');
    const verifyBtn = document.getElementById('verifyBtn');
    const verifyAddressInput = document.getElementById('verifyAddressInput');

    const checkStatusBtn = document.getElementById('checkStatusBtn');
    const statusAddressInput = document.getElementById('statusAddressInput');

    // --- Global State ---
    let web3;
    let contract;
    let userAccount;
    let contractAdmin;

    // --- Helper Functions ---

    /**
     * Logs a message to the on-screen log div.
     * @param {string} message - The message to display.
     * @param {string} type - 'info', 'success', 'error', or 'tx'.
     */
    function log(message, type = 'info') {
        const p = document.createElement('p');
        p.textContent = message;
        p.className = type;
        logDiv.appendChild(p);
        logDiv.scrollTop = logDiv.scrollHeight; // Auto-scroll to the bottom
    }

    /**
     * Updates the UI to reflect the wallet connection status.
     */
    function updateUI() {
        if (userAccount) {
            walletStatus.textContent = 'Status: Connected';
            walletStatus.className = 'connected';
            walletAddress.textContent = `Your Address: ${userAccount}`;
            connectWalletBtn.textContent = 'Wallet Connected';
            connectWalletBtn.disabled = true;
            log(`Wallet connected: ${userAccount}`, 'success');

            // Check if the connected user is the admin
            if (userAccount.toLowerCase() === contractAdmin.toLowerCase()) {
                adminSection.style.display = 'block';
                log('Admin account connected. Verification panel is visible.', 'info');
            } else {
                adminSection.style.display = 'none';
            }
        } else {
            walletStatus.textContent = 'Status: Not Connected';
            walletStatus.className = 'not-connected';
            walletAddress.textContent = '';
            connectWalletBtn.textContent = 'Connect Wallet';
            connectWalletBtn.disabled = false;
            adminSection.style.display = 'none';
        }
    }

    // --- Core Functions ---

    /**
     * Connects to the user's MetaMask wallet.
     */
    async function connectWallet() {
        if (typeof window.ethereum !== 'undefined') {
            try {
                // Request account access
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                userAccount = accounts[0];

                // Initialize Web3 and the contract instance
                web3 = new Web3(window.ethereum);
                
                // Check if ABI and Address are provided
                if (!contractAddress || contractAddress === 'PASTE_YOUR_CONTRACT_ADDRESS_HERE' || contractABI.length === 0) {
                    log('ERROR: Contract Address or ABI is not set in app.js!', 'error');
                    alert('Please paste the contract address and ABI into app.js first.');
                    return;
                }
                
                contract = new web3.eth.Contract(contractABI, contractAddress);

                // Get the admin address from the contract
                contractAdmin = await contract.methods.admin().call();
                log(`Contract admin is: ${contractAdmin}`, 'info');

                updateUI();

                // Listen for account changes in MetaMask
                window.ethereum.on('accountsChanged', (newAccounts) => {
                    userAccount = newAccounts[0];
                    log('Account changed in MetaMask.', 'info');
                    updateUI();
                });

            } catch (error) {
                log(`Error connecting wallet: ${error.message}`, 'error');
                console.error("Error connecting wallet:", error);
            }
        } else {
            log('MetaMask is not installed. Please install it to use this dApp.', 'error');
            alert('MetaMask is not installed. Please install it to use this dApp.');
        }
    }

    /**
     * Registers the user's KYC hash on the blockchain.
     */
    async function registerKYC() {
        if (!contract || !userAccount) {
            log('Please connect your wallet first.', 'error');
            return;
        }

        const kycHash = kycHashInput.value;
        if (!kycHash) {
            log('KYC hash cannot be empty.', 'error');
            return;
        }

        log(`Attempting to register KYC hash: "${kycHash}"...`, 'info');
        try {
            const tx = contract.methods.registerKYC(kycHash).send({ from: userAccount });

            tx.on('transactionHash', (hash) => {
                log(`Transaction sent. Hash: ${hash}`, 'tx');
            });

            tx.on('receipt', (receipt) => {
                log('KYC registration successful!', 'success');
                console.log('Transaction receipt:', receipt);
            });

            tx.on('error', (error) => {
                log(`Error during registration: ${error.message}`, 'error');
                console.error('Transaction error:', error);
            });

        } catch (error) {
            log(`Failed to send transaction: ${error.message}`, 'error');
            console.error('Error sending transaction:', error);
        }
    }

    /**
     * Verifies a user's KYC (Admin only).
     */
    async function verifyKYC() {
        if (!contract || !userAccount) {
            log('Please connect your wallet first.', 'error');
            return;
        }

        const addressToVerify = verifyAddressInput.value;
        if (!web3.utils.isAddress(addressToVerify)) {
            log('Invalid Ethereum address provided for verification.', 'error');
            return;
        }

        log(`Admin attempting to verify address: ${addressToVerify}...`, 'info');
        try {
            const tx = contract.methods.verifyKYC(addressToVerify).send({ from: userAccount });

            tx.on('transactionHash', (hash) => {
                log(`Verification transaction sent. Hash: ${hash}`, 'tx');
            });

            tx.on('receipt', (receipt) => {
                log(`Successfully verified KYC for ${addressToVerify}!`, 'success');
            });

            tx.on('error', (error) => {
                log(`Error during verification: ${error.message}`, 'error');
            });

        } catch (error) {
            log(`Failed to send verification transaction: ${error.message}`, 'error');
        }
    }

    /**
     * Checks the KYC status of a given address.
     */
    async function checkStatus() {
        if (!contract) {
            log('Please connect your wallet first to interact with the contract.', 'error');
            return;
        }

        const addressToCheck = statusAddressInput.value;
        if (!web3.utils.isAddress(addressToCheck)) {
            log('Invalid Ethereum address provided for status check.', 'error');
            return;
        }

        log(`Checking KYC status for address: ${addressToCheck}...`, 'info');
        try {
            // The getKYCStatus function returns multiple values, which come back as an object/array.
            const status = await contract.methods.getKYCStatus(addressToCheck).call();
            const [userHash, isVerified, isRegistered] = Object.values(status);

            if (!isRegistered) {
                log(`Status for ${addressToCheck}: NOT REGISTERED.`, 'info');
            } else {
                log(`Status for ${addressToCheck}:`, 'info');
                log(`  - Registered: Yes`, 'info');
                log(`  - KYC Hash: ${userHash}`, 'info');
                log(`  - Verified: ${isVerified ? 'Yes' : 'No'}`, isVerified ? 'success' : 'info');
            }
        } catch (error) {
            log(`Error checking status: ${error.message}`, 'error');
            console.error('Error fetching status:', error);
        }
    }

    // --- Event Listeners ---
    connectWalletBtn.addEventListener('click', connectWallet);
    registerBtn.addEventListener('click', registerKYC);
    verifyBtn.addEventListener('click', verifyKYC);
    checkStatusBtn.addEventListener('click', checkStatus);

    // --- Initial UI State ---
    updateUI();
    log('dApp loaded. Please connect your wallet.');
});
  