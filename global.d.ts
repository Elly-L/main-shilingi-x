// Declare global types for TypeScript

declare module 'ethers' {
  export * from 'ethers/lib/ethers';
}

// Declare module for JSON imports
declare module '*.json' {
  const value: any;
  export default value;
} 