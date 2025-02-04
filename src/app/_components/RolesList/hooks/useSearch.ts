import {useMemo, useState} from "react";
import debounce from "lodash.debounce";
import {sendGAEvent} from "@next/third-parties/google";

export const useSearch = () => {
    const [searchValue, setSearchValue] = useState<string>('');

    const search = useMemo(() => debounce((value: string) =>{
        setSearchValue(value);
        sendGAEvent('event', 'search', { value });
    }, 200), []);

    return {
        searchValue,
        search,
    };
}
