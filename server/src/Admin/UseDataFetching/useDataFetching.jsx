// useDataFetching.js
import { useState, useEffect } from "react";
import { message } from "antd";

export const useDataFetching = (fetchFunction, errorMessage) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const result = await fetchFunction();
                setData(result);
            } catch (error) {
                console.error(error);
                message.error(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [fetchFunction, errorMessage]);

    return { data, loading, setData };
};
