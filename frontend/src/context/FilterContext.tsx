import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { api } from '../api';

interface FilterContextType {
    years: number[];
    faculties: string[];
    selectedYear: number | undefined;
    selectedFaculty: string | undefined;
    setSelectedYear: (y: number | undefined) => void;
    setSelectedFaculty: (f: string | undefined) => void;
    refreshVersion: number;
    triggerRefresh: () => void;
}

const FilterContext = createContext<FilterContextType>({
    years: [], faculties: [],
    selectedYear: undefined, selectedFaculty: undefined,
    setSelectedYear: () => { }, setSelectedFaculty: () => { },
    refreshVersion: 0, triggerRefresh: () => { },
});

export function FilterProvider({ children }: { children: ReactNode }) {
    const [years, setYears] = useState<number[]>([]);
    const [faculties, setFaculties] = useState<string[]>([]);
    const [selectedYear, setSelectedYear] = useState<number | undefined>();
    const [selectedFaculty, setSelectedFaculty] = useState<string | undefined>();
    const [refreshVersion, setRefreshVersion] = useState(0);

    const triggerRefresh = () => setRefreshVersion(v => v + 1);

    useEffect(() => {
        api.getFilters().then(f => {
            setYears(f.years || []);
            setFaculties(f.faculties || []);
            if (f.years?.length && !selectedYear) setSelectedYear(f.years[0]);
        }).catch(() => { });
    }, [refreshVersion]);

    return (
        <FilterContext.Provider value={{
            years, faculties, selectedYear, selectedFaculty,
            setSelectedYear, setSelectedFaculty,
            refreshVersion, triggerRefresh,
        }}>
            {children}
        </FilterContext.Provider>
    );
}

export const useFilters = () => useContext(FilterContext);
