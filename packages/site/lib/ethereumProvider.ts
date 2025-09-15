// Handle ethereum provider conflicts and provide fallback
export function getEthereumProvider() {
  if (typeof window === 'undefined') {
    return null;
  }

  const win = window as any;
  
  // Try to get ethereum provider with error handling
  try {
    if (win.ethereum) {
      return win.ethereum;
    }
  } catch (error) {
    console.warn('Error accessing window.ethereum:', error);
  }

  // Try to get from EIP-6963 providers
  try {
    if (win.eip6963Providers) {
      const providers = win.eip6963Providers;
      for (const provider of providers) {
        if (provider.info.name.toLowerCase().includes('metamask')) {
          return provider.provider;
        }
      }
    }
  } catch (error) {
    console.warn('Error accessing EIP-6963 providers:', error);
  }

  return null;
}

// Safe ethereum request wrapper
export async function safeEthereumRequest(method: string, params?: any[]) {
  const provider = getEthereumProvider();
  
  if (!provider) {
    throw new Error('No ethereum provider found');
  }

  try {
    return await provider.request({ method, params });
  } catch (error) {
    console.error(`Ethereum request failed (${method}):`, error);
    throw error;
  }
}
