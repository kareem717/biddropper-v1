import useSWR from 'swr';

const fetcher = async (url: string) => {
  const res = await fetch(url, {
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
  const { data, error } = useSWR('/api/industries', fetcher);

  return {
    industries: data,
    isLoading: !error && !data,
    isError: error
  }
};

export default useIndustries;