import React, { useState, useEffect } from 'react';

interface NFTPreviewProps {
  metadataURI: string;
}

const NFTPreview: React.FC<NFTPreviewProps> = ({ metadataURI }) => {
  const [metadata, setMetadata] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        setIsLoading(true);
        // Convertir IPFS URI en HTTP pour récupérer les données
        const ipfsGatewayUrl = metadataURI.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
        
        const response = await fetch(ipfsGatewayUrl);
        if (!response.ok) {
          throw new Error('Cant fetch metadata');
        }
        
        const data = await response.json();
        setMetadata(data);
      } catch (err) {
        console.error('Error loading metadata:', err);
        setError('Cant load NFT METADATA');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (metadataURI) {
      fetchMetadata();
    }
  }, [metadataURI]);
  
  if (isLoading) {
    return <div className="nft-preview-loading">Chargement de la prévisualisation...</div>;
  }
  
  if (error || !metadata) {
    return <div className="nft-preview-error">Impossible de charger l'aperçu du NFT</div>;
  }
  
  // Convertir l'URI de l'image en URL HTTP
  const imageUrl = metadata.image?.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
  
  return (
    <div className="nft-preview-container">
      <h4 className="nft-preview-title">{metadata.name}</h4>
      {imageUrl && (
        <div className="nft-preview-image-container">
          <img 
            src={imageUrl} 
            alt={metadata.name} 
            className="nft-preview-image" 
            onError={(e) => {
              // Fallback en cas d'erreur de chargement d'image
              e.currentTarget.src = '/images/nft-placeholder.png';
            }}
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