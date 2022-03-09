import { assert } from "chai";

import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { TokenTransfer } from '../target/types/token_transfer';

import { TOKEN_PROGRAM_ID, Token, createMint, getOrCreateAssociatedTokenAccount, mintTo, transfer } from "@solana/spl-token";

const fromWallet = anchor.web3.Keypair.generate();
const provider = anchor.Provider.local();
let pdaAssocAccount = null as anchor.web3.PublicKey;
let mint = null as Token;
let mintedToAccount = null as anchor.web3.PublicKey;
let fromTokenAccount = null as Token;
let programsVaultAccount = null as anchor.web3.PublicKey;

describe('token-transfer', () => {

  // Configure the client to use the local cluster.
  anchor.setProvider(provider);

  const program = anchor.workspace.TokenTransfer as Program<TokenTransfer>;

  it ('init env', async() => {
  	await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(fromWallet.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL),
      "processed"
    );
    mint = await createMint(
      provider.connection,
      fromWallet,
      fromWallet.publicKey,
      null,
      5
    );
    [programsVaultAccount] = await anchor.web3.PublicKey.findProgramAddress(
      [anchor.utils.bytes.utf8.encode("vault")],
      program.programId
    );
    // pdaAssocAccount = await mint.createAccount(programsVaultAccount)

    fromTokenAccount = await getOrCreateAssociatedTokenAccount(
        provider.connection,
        fromWallet,
        mint,
        fromWallet.publicKey
    );

    let sig = await mintTo(
    	provider.connection,
      fromWallet,
      mint,
      fromTokenAccount.address,
      fromWallet.publicKey,
      1000000, // 10
      []
    );
  });

  it('Transferred!', async () => {
    // Add your test here.
    const tx = await program.rpc.transfer(
    	new anchor.BN(1000000),
    	{
    		accounts: {
    			authority: fromWallet.publicKey,
    			mint: mint,
    			usersVault: fromTokenAccount.address,
    			programsVault: programsVaultAccount,
    			tokenProgram: TOKEN_PROGRAM_ID,
    			rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    			systemProgram: anchor.web3.SystemProgram.programId,
    		},
    		signers: [fromWallet]
    	});
    console.log("Your transaction signature", tx);
  });
});
