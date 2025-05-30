# ShilingiX Deployment Guide

This guide explains the steps to deploy the ShilingiX application successfully to Netlify.

## Fixed Issues

1. **Ethers.js Version Compatibility**
   - Fixed the compatibility issues with ethers.js by explicitly setting version 5.7.2 in package.json
   - Simplified contractService.ts to only use ethers v5 syntax

2. **Supabase Integration**
   - Modified supabaseClient.ts to handle missing environment variables during build
   - Added placeholder values in netlify.toml to prevent build errors
   - Updated next.config.mjs to avoid static generation issues during build

3. **Contract ABI**
   - Created a proper ABI file for the ShilingiXAssetManager contract

## Deployment Steps

### 1. Configure Netlify Environment Variables

In your Netlify dashboard, set the following environment variables:

**Required Variables:**
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `HEDERA_PRIVATE_KEY`: Your Hedera private key (keep this secure!)

**Optional Variables (already set in netlify.toml):**
- `NEXT_PUBLIC_CONTRACT_ADDRESS`: The deployed contract address
- `NEXT_PUBLIC_RPC_URL`: Hedera RPC URL
- `HEDERA_ACCOUNT_ID`: Your Hedera account ID

### 2. Deploy on Netlify

Connect your GitHub repository to Netlify and use the following build settings:

- **Build command**: `pnpm run build`
- **Publish directory**: `.next`

### 3. Netlify Configuration

Make sure to add the Netlify plugin for Next.js:

```bash
netlify plugins:install @netlify/plugin-nextjs
```

This is already configured in the netlify.toml file.

### 4. Verify Environment Variables

Double-check that all environment variables are correctly set in the Netlify dashboard. The build will fail if the Supabase URL and anonymous key are not provided.

### 5. Post-Deployment Verification

After deployment, verify that:

1. The application can connect to Supabase
2. The smart contract interaction works properly
3. Users can view their assets and balances
4. Transactions can be executed successfully

## Troubleshooting

If you encounter issues:

1. **Build Errors**: 
   - Check the Netlify build logs for specific errors
   - Make sure all environment variables are correctly set in the Netlify dashboard
   - Try disabling static generation completely in the Netlify dashboard

2. **Smart Contract Connection Issues**:
   - Confirm that the contract address and RPC URL are correct
   - Make sure the contract ABI in `/contracts/ShilingiXAssetManager.json` matches your deployed contract

3. **Supabase Errors**:
   - Verify that your Supabase project is properly set up
   - Check that the provided URL and anonymous key are correct
   - Ensure that the Supabase client is initialized only when needed

4. **Ethers.js Issues**:
   - If you see ethers.js-related errors, ensure package.json specifies version 5.7.2
   - Check for any syntax that might be using v6 features

## Contact

For additional support, please contact the ShilingiX development team. 