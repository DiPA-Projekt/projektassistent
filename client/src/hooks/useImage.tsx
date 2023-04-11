import { useEffect, useState } from 'react';

const useImage = (filePath: string) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [image, setImage] = useState(null);

  useEffect((): void => {
    const fetchImage = async (): Promise<void> => {
      try {
        const response = await import(`../assets/img/${filePath}`);
        setImage(response.default);
      } catch (error: any) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchImage().then();
  }, [filePath]);

  return {
    error,
    image,
    loading,
  };
};

export default useImage;
