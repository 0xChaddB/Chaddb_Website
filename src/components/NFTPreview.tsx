import React, { useState, useEffect, useCallback } from 'react';

interface NFTPreviewProps {
  metadataURI: string;
}

const NFTPreview: React.FC<NFTPreviewProps> = ({ metadataURI }) => {
  const [metadata, setMetadata] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetadata = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const ipfsGatewayUrl = metadataURI.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
      const response = await fetch(ipfsGatewayUrl, { signal: AbortSignal.timeout(10000) }); // Timeout 10s
      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}`);
      }
      const data = await response.json();
      if (!data.name || !data.image) {
        throw new Error('Métadonnées incomplètes');
      }
      setMetadata(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error loading metadata:', err);
      setError(`Can't upload metadata: ${message}`);
    } finally {
      setIsLoading(false);
    }
  }, [metadataURI]);

  useEffect(() => {
    if (metadataURI) {
      fetchMetadata();
    }
  }, [metadataURI, fetchMetadata]);

  if (isLoading) {
    return (
      <div className="nft-preview-loading" aria-live="polite">
        Loading preview...
      </div>
    );
  }

  if (error || !metadata) {
    return (
      <div className="nft-preview-error" aria-live="assertive">
        {error || "Impossible de charger l'aperçu du NFT"}
      </div>
    );
  }

  const imageUrl = metadata.image?.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');

  return (
    <div className="nft-preview-container" role="region" aria-label={`NFT Preview ${metadata.name}`}>
      <h4 className="nft-preview-title">{metadata.name}</h4>
      {imageUrl && (
        <div className="nft-preview-image-container">
          <img
            src={imageUrl}
            alt={`NFT image ${metadata.name}`}
            className="nft-preview-image"
            onError={(e) => {
              e.currentTarget.src = '/images/LogoRecolored.jpg';
              e.currentTarget.alt = `Image available for ${metadata.name}`;
            }}
            loading="lazy"
          />
        </div>
      )}
      <p className="nft-preview-description">{metadata.description}</p>
      {metadata.attributes && metadata.attributes.length > 0 && (
        <div className="nft-preview-attributes">
          <h5>Attributs</h5>
          <div className="nft-preview-attributes-grid">
            {metadata.attributes.map((attr: any, index: number) => (
              <div key={index} className="nft-preview-attribute">
                <span className="nft-preview-attribute-name">{attr.trait_type}</span>
                <span className="nft-preview-attribute-value">{attr.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NFTPreview;