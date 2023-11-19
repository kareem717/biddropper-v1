import { useQuery } from 'react-query';

const fetchIndustries = async () => {
  const res = await fetch('/api/industries', {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    throw new Error('Network response was not ok');
  }
  return res.json();
};

const useIndustries = () => {
  const { data, isLoading, isError } = useQuery('industries', fetchIndustries);

  return {
    industries: data,
    isLoading,
    isError
  }
};

export default useIndustries;