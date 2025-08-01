import { useState } from "react";

const useFetch = (cb) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fn = async (...args) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await cb(...args);

      // If server responded with { success: false, message: "..." }
      if (result && result.success === false) {
        setError(result.message || "Operation failed");
        return result;
      }

      setData(result);
      return result;
    } catch (err) {
      setError(err?.message || "Something went wrong");
      return { success: false, message: err?.message || "Unknown error" };
    } finally {
      setIsLoading(false);
    }
  };

  return { data, isLoading, error, fn };
};

export default useFetch;
