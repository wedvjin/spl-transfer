use anchor_lang::prelude::*;
use anchor_spl::token::{TokenAccount};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod token_transfer {
    use super::*;
    pub fn transfer(ctx: Context<Transfer>, amount: u64) -> ProgramResult {

    	let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            anchor_spl::token::Transfer {
                from: ctx.accounts.users_vault.to_account_info(),
                to: ctx.accounts.programs_vault.to_account_info(),
                authority: ctx.accounts.authority.to_account_info(),
            },
        );

        anchor_spl::token::transfer(cpi_ctx, amount)?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Transfer<'info> {
	#[account(mut)]
	pub authority: Signer<'info>,
	pub mint: AccountInfo<'info>,
	#[account(mut)]
	pub users_vault: Account<'info, TokenAccount>,
	#[account(
		init,
		payer = authority,
        token::mint = mint,
        token::authority = authority,
		seeds = [b"vault".as_ref()],
		bump,
		)]
	pub programs_vault: Account<'info, TokenAccount>,

	pub token_program: AccountInfo<'info>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: AccountInfo<'info>,
}
